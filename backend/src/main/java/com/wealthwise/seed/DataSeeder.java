package com.wealthwise.seed;

import com.wealthwise.model.*;
import com.wealthwise.model.enums.*;
import com.wealthwise.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Seeds the database with mock data on startup — represents a
 * fragmented portfolio across Zerodha, Groww, and NSDL.
 */
@Component
public class DataSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final PortfolioItemRepository portfolioItemRepository;
    private final AssetMasterRepository assetMasterRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository,
                      PortfolioItemRepository portfolioItemRepository,
                      AssetMasterRepository assetMasterRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.portfolioItemRepository = portfolioItemRepository;
        this.assetMasterRepository = assetMasterRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail("demo@wealthwise.in")) {
            log.info("Demo data already exists — skipping seed.");
            return;
        }

        log.info("Seeding demo data...");

        // 1. Create demo user with risk profile
        User user = User.builder()
                .email("demo@wealthwise.in")
                .passwordHash(passwordEncoder.encode("demo123"))
                .fullName("Arjun Mehta")
                .panNumber("ABCPM1234A")
                .build();

        RiskProfile riskProfile = RiskProfile.builder()
                .user(user)
                .riskLevel(RiskLevel.MODERATE)
                .investmentHorizonYears(5)
                .annualIncome(BigDecimal.valueOf(1800000))
                .existingDebt(BigDecimal.valueOf(200000))
                .hasAlternateAssetExperience(false)
                .assessedAt(LocalDateTime.now())
                .build();
        user.setRiskProfile(riskProfile);
        user = userRepository.save(user);

        // 2. Seed fragmented portfolio items across brokers
        seedPortfolioItems(user);

        // 3. Seed asset master catalog
        seedAssetMaster();

        log.info("Demo data seeded successfully!");
    }

    private void seedPortfolioItems(User user) {
        List<PortfolioItem> items = List.of(
            // --- Zerodha Holdings (5 equities) ---
            PortfolioItem.builder().user(user).assetType(AssetType.EQUITY).ticker("RELIANCE")
                .assetName("Reliance Industries Ltd").quantity(BigDecimal.valueOf(15))
                .avgBuyPrice(BigDecimal.valueOf(2350)).currentPrice(BigDecimal.valueOf(2890))
                .brokerSource(BrokerSource.ZERODHA).sector("Oil & Gas").lastUpdated(LocalDate.now()).build(),

            PortfolioItem.builder().user(user).assetType(AssetType.EQUITY).ticker("TCS")
                .assetName("Tata Consultancy Services").quantity(BigDecimal.valueOf(10))
                .avgBuyPrice(BigDecimal.valueOf(3200)).currentPrice(BigDecimal.valueOf(3950))
                .brokerSource(BrokerSource.ZERODHA).sector("IT").lastUpdated(LocalDate.now()).build(),

            PortfolioItem.builder().user(user).assetType(AssetType.EQUITY).ticker("HDFCBANK")
                .assetName("HDFC Bank Ltd").quantity(BigDecimal.valueOf(25))
                .avgBuyPrice(BigDecimal.valueOf(1520)).currentPrice(BigDecimal.valueOf(1680))
                .brokerSource(BrokerSource.ZERODHA).sector("Financial Services").lastUpdated(LocalDate.now()).build(),

            PortfolioItem.builder().user(user).assetType(AssetType.EQUITY).ticker("INFY")
                .assetName("Infosys Ltd").quantity(BigDecimal.valueOf(20))
                .avgBuyPrice(BigDecimal.valueOf(1400)).currentPrice(BigDecimal.valueOf(1580))
                .brokerSource(BrokerSource.ZERODHA).sector("IT").lastUpdated(LocalDate.now()).build(),

            PortfolioItem.builder().user(user).assetType(AssetType.EQUITY).ticker("ICICIBANK")
                .assetName("ICICI Bank Ltd").quantity(BigDecimal.valueOf(30))
                .avgBuyPrice(BigDecimal.valueOf(890)).currentPrice(BigDecimal.valueOf(1120))
                .brokerSource(BrokerSource.ZERODHA).sector("Financial Services").lastUpdated(LocalDate.now()).build(),

            // --- Groww Holdings (3 MFs + 2 equities) ---
            PortfolioItem.builder().user(user).assetType(AssetType.MUTUAL_FUND).ticker("PPFAS_FO")
                .assetName("Parag Parikh Flexi Cap Fund").quantity(BigDecimal.valueOf(500))
                .avgBuyPrice(BigDecimal.valueOf(52)).currentPrice(BigDecimal.valueOf(68))
                .brokerSource(BrokerSource.GROWW).sector("Multi-Cap").lastUpdated(LocalDate.now()).build(),

            PortfolioItem.builder().user(user).assetType(AssetType.MUTUAL_FUND).ticker("AXIS_BLUE")
                .assetName("Axis Bluechip Fund").quantity(BigDecimal.valueOf(350))
                .avgBuyPrice(BigDecimal.valueOf(42)).currentPrice(BigDecimal.valueOf(49))
                .brokerSource(BrokerSource.GROWW).sector("Large Cap").lastUpdated(LocalDate.now()).build(),

            PortfolioItem.builder().user(user).assetType(AssetType.MUTUAL_FUND).ticker("MIRAE_EM")
                .assetName("Mirae Asset Emerging Bluechip").quantity(BigDecimal.valueOf(200))
                .avgBuyPrice(BigDecimal.valueOf(95)).currentPrice(BigDecimal.valueOf(112))
                .brokerSource(BrokerSource.GROWW).sector("Large & Mid Cap").lastUpdated(LocalDate.now()).build(),

            PortfolioItem.builder().user(user).assetType(AssetType.EQUITY).ticker("TATAMOTORS")
                .assetName("Tata Motors Ltd").quantity(BigDecimal.valueOf(40))
                .avgBuyPrice(BigDecimal.valueOf(620)).currentPrice(BigDecimal.valueOf(780))
                .brokerSource(BrokerSource.GROWW).sector("Automobile").lastUpdated(LocalDate.now()).build(),

            PortfolioItem.builder().user(user).assetType(AssetType.EQUITY).ticker("WIPRO")
                .assetName("Wipro Ltd").quantity(BigDecimal.valueOf(50))
                .avgBuyPrice(BigDecimal.valueOf(420)).currentPrice(BigDecimal.valueOf(465))
                .brokerSource(BrokerSource.GROWW).sector("IT").lastUpdated(LocalDate.now()).build(),

            // --- NSDL Holdings (3 bonds + 2 REITs) ---
            PortfolioItem.builder().user(user).assetType(AssetType.CORPORATE_BOND).ticker("HDFCBOND24")
                .assetName("HDFC Ltd Bond 8.75% 2024").quantity(BigDecimal.valueOf(20))
                .avgBuyPrice(BigDecimal.valueOf(1000)).currentPrice(BigDecimal.valueOf(1045))
                .brokerSource(BrokerSource.NSDL).sector("Financial Services").lastUpdated(LocalDate.now()).build(),

            PortfolioItem.builder().user(user).assetType(AssetType.GOVERNMENT_BOND).ticker("GSEC2030")
                .assetName("GOI Bond 7.26% 2030").quantity(BigDecimal.valueOf(30))
                .avgBuyPrice(BigDecimal.valueOf(100)).currentPrice(BigDecimal.valueOf(103.50))
                .brokerSource(BrokerSource.NSDL).sector("Government").lastUpdated(LocalDate.now()).build(),

            PortfolioItem.builder().user(user).assetType(AssetType.CORPORATE_BOND).ticker("NHAIBOND")
                .assetName("NHAI Bond 7.75% 2027").quantity(BigDecimal.valueOf(15))
                .avgBuyPrice(BigDecimal.valueOf(1000)).currentPrice(BigDecimal.valueOf(1030))
                .brokerSource(BrokerSource.NSDL).sector("Infrastructure").lastUpdated(LocalDate.now()).build(),

            PortfolioItem.builder().user(user).assetType(AssetType.REIT).ticker("MINDSPACE")
                .assetName("Mindspace Business Parks REIT").quantity(BigDecimal.valueOf(100))
                .avgBuyPrice(BigDecimal.valueOf(310)).currentPrice(BigDecimal.valueOf(345))
                .brokerSource(BrokerSource.NSDL).sector("Real Estate").lastUpdated(LocalDate.now()).build(),

            PortfolioItem.builder().user(user).assetType(AssetType.REIT).ticker("EMBASSY")
                .assetName("Embassy Office Parks REIT").quantity(BigDecimal.valueOf(80))
                .avgBuyPrice(BigDecimal.valueOf(340)).currentPrice(BigDecimal.valueOf(380))
                .brokerSource(BrokerSource.NSDL).sector("Real Estate").lastUpdated(LocalDate.now()).build()
        );

        portfolioItemRepository.saveAll(items);
        log.info("Seeded {} portfolio items across Zerodha, Groww, and NSDL", items.size());
    }

    private void seedAssetMaster() {
        List<AssetMaster> assets = List.of(
            // Equities
            AssetMaster.builder().assetType(AssetType.EQUITY).ticker("RELIANCE").name("Reliance Industries Ltd")
                .issuer("Reliance Industries").description("India's largest conglomerate with interests in petrochemicals, refining, oil & gas exploration, retail, and telecom (Jio).")
                .currentPrice(BigDecimal.valueOf(2890)).yieldPercent(BigDecimal.valueOf(0.3)).minInvestment(BigDecimal.valueOf(2890))
                .riskLevel(RiskLevel.MODERATE).sector("Oil & Gas").isAlternateAsset(false).listedDate(LocalDateTime.of(1977, 1, 1, 0, 0)).build(),

            AssetMaster.builder().assetType(AssetType.EQUITY).ticker("TCS").name("Tata Consultancy Services")
                .issuer("Tata Group").description("India's largest IT services company and a global leader in consulting and business solutions.")
                .currentPrice(BigDecimal.valueOf(3950)).yieldPercent(BigDecimal.valueOf(1.2)).minInvestment(BigDecimal.valueOf(3950))
                .riskLevel(RiskLevel.MODERATE).sector("IT").isAlternateAsset(false).listedDate(LocalDateTime.of(2004, 8, 25, 0, 0)).build(),

            AssetMaster.builder().assetType(AssetType.EQUITY).ticker("HDFCBANK").name("HDFC Bank Ltd")
                .issuer("HDFC Bank").description("India's largest private sector bank by market capitalization with strong retail and wholesale banking operations.")
                .currentPrice(BigDecimal.valueOf(1680)).yieldPercent(BigDecimal.valueOf(1.1)).minInvestment(BigDecimal.valueOf(1680))
                .riskLevel(RiskLevel.MODERATE).sector("Financial Services").isAlternateAsset(false).listedDate(LocalDateTime.of(1995, 5, 1, 0, 0)).build(),

            AssetMaster.builder().assetType(AssetType.EQUITY).ticker("INFY").name("Infosys Ltd")
                .issuer("Infosys").description("Global leader in technology services and consulting, a pioneer of the Indian IT revolution.")
                .currentPrice(BigDecimal.valueOf(1580)).yieldPercent(BigDecimal.valueOf(2.5)).minInvestment(BigDecimal.valueOf(1580))
                .riskLevel(RiskLevel.MODERATE).sector("IT").isAlternateAsset(false).listedDate(LocalDateTime.of(1993, 6, 1, 0, 0)).build(),

            // REITs
            AssetMaster.builder().assetType(AssetType.REIT).ticker("MINDSPACE").name("Mindspace Business Parks REIT")
                .issuer("K Raheja Corp").description("Owns and operates 31.8 MSF of Grade A office portfolio across Mumbai, Hyderabad, Pune, and Chennai. Tenants include Accenture, JP Morgan, and Barclays. SEBI mandates 90% income distribution.")
                .currentPrice(BigDecimal.valueOf(345)).yieldPercent(BigDecimal.valueOf(6.5)).minInvestment(BigDecimal.valueOf(345))
                .riskLevel(RiskLevel.MODERATE).sector("Real Estate").isAlternateAsset(true).factsheetRef("mindspace-reit")
                .listedDate(LocalDateTime.of(2020, 8, 7, 0, 0)).build(),

            AssetMaster.builder().assetType(AssetType.REIT).ticker("EMBASSY").name("Embassy Office Parks REIT")
                .issuer("Embassy Group").description("India's first listed REIT with 42.4 MSF of office space across Bangalore, Mumbai, Pune, and NCR. Anchor tenants include IBM, Google, and Cognizant.")
                .currentPrice(BigDecimal.valueOf(380)).yieldPercent(BigDecimal.valueOf(7.0)).minInvestment(BigDecimal.valueOf(380))
                .riskLevel(RiskLevel.MODERATE).sector("Real Estate").isAlternateAsset(true).factsheetRef("embassy-reit")
                .listedDate(LocalDateTime.of(2019, 4, 1, 0, 0)).build(),

            AssetMaster.builder().assetType(AssetType.REIT).ticker("BROOKFIELD").name("Brookfield India Real Estate Trust")
                .issuer("Brookfield Asset Management").description("Owns premium Grade A commercial office assets in Mumbai, Gurugram, Noida, and Kolkata totaling ~18.7 MSF.")
                .currentPrice(BigDecimal.valueOf(285)).yieldPercent(BigDecimal.valueOf(6.0)).minInvestment(BigDecimal.valueOf(285))
                .riskLevel(RiskLevel.MODERATE).sector("Real Estate").isAlternateAsset(true).factsheetRef("brookfield-reit")
                .listedDate(LocalDateTime.of(2021, 2, 17, 0, 0)).build(),

            // InvITs
            AssetMaster.builder().assetType(AssetType.INVIT).ticker("PGCIL").name("PowerGrid Infrastructure Investment Trust")
                .issuer("Power Grid Corporation of India").description("Owns and operates power transmission assets including 11 transmission lines and 3 substations. Backed by India's largest power transmission utility.")
                .currentPrice(BigDecimal.valueOf(142)).yieldPercent(BigDecimal.valueOf(10.5)).minInvestment(BigDecimal.valueOf(142))
                .riskLevel(RiskLevel.CONSERVATIVE).sector("Infrastructure").isAlternateAsset(true).factsheetRef("powergrid-invit")
                .listedDate(LocalDateTime.of(2021, 5, 14, 0, 0)).build(),

            AssetMaster.builder().assetType(AssetType.INVIT).ticker("IRBINVIT").name("IRB InvIT Fund")
                .issuer("IRB Infrastructure").description("India's first listed InvIT owning a portfolio of 6 operational BOT highway projects spanning 4,400+ lane-km.")
                .currentPrice(BigDecimal.valueOf(78)).yieldPercent(BigDecimal.valueOf(8.5)).minInvestment(BigDecimal.valueOf(78))
                .riskLevel(RiskLevel.MODERATE).sector("Infrastructure").isAlternateAsset(true).factsheetRef("irb-invit")
                .listedDate(LocalDateTime.of(2017, 5, 15, 0, 0)).build(),

            // Corporate Bonds
            AssetMaster.builder().assetType(AssetType.CORPORATE_BOND).ticker("HDFCBOND25").name("HDFC Corp Bond 8.5% 2025")
                .issuer("HDFC Ltd").description("AAA-rated corporate bond from HDFC Ltd with 8.5% annual coupon and 2025 maturity. Low credit risk with regular interest payments.")
                .currentPrice(BigDecimal.valueOf(1020)).yieldPercent(BigDecimal.valueOf(8.5)).minInvestment(BigDecimal.valueOf(10000))
                .riskLevel(RiskLevel.CONSERVATIVE).sector("Financial Services").isAlternateAsset(true).factsheetRef("hdfc-corporate-bond")
                .listedDate(LocalDateTime.of(2022, 3, 1, 0, 0)).build(),

            AssetMaster.builder().assetType(AssetType.CORPORATE_BOND).ticker("ABORDBOND").name("Aditya Birla Bond 9.0% 2026")
                .issuer("Aditya Birla Finance").description("AA+-rated corporate bond offering 9.0% annual coupon. Higher yield reflecting slightly elevated credit risk versus AAA bonds.")
                .currentPrice(BigDecimal.valueOf(1035)).yieldPercent(BigDecimal.valueOf(9.0)).minInvestment(BigDecimal.valueOf(10000))
                .riskLevel(RiskLevel.MODERATE).sector("Financial Services").isAlternateAsset(true)
                .listedDate(LocalDateTime.of(2023, 1, 15, 0, 0)).build(),

            AssetMaster.builder().assetType(AssetType.GOVERNMENT_BOND).ticker("GSEC2030").name("GOI Bond 7.26% 2030")
                .issuer("Government of India").description("Sovereign government bond with 7.26% annual coupon and 2030 maturity. Zero credit risk — backed by the full faith of the Indian government.")
                .currentPrice(BigDecimal.valueOf(103.50)).yieldPercent(BigDecimal.valueOf(7.26)).minInvestment(BigDecimal.valueOf(10000))
                .riskLevel(RiskLevel.CONSERVATIVE).sector("Government").isAlternateAsset(true)
                .listedDate(LocalDateTime.of(2020, 6, 1, 0, 0)).build()
        );

        assetMasterRepository.saveAll(assets);
        log.info("Seeded {} asset master records", assets.size());
    }
}
