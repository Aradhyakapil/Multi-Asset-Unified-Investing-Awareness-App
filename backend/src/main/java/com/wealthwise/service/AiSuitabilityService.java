package com.wealthwise.service;

import com.wealthwise.dto.AiChatDTO;
import com.wealthwise.dto.SuitabilityResponseDTO;
import com.wealthwise.model.AssetMaster;
import com.wealthwise.model.RiskProfile;
import com.wealthwise.model.enums.AssetType;
import com.wealthwise.model.enums.RiskLevel;
import com.wealthwise.repository.AssetMasterRepository;
import com.wealthwise.repository.RiskProfileRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.*;

/**
 * AI Suitability Engine — evaluates asset-user fit using a rule-based
 * fallback system. In production, this would integrate with Spring AI
 * and pgvector for RAG-powered responses.
 *
 * The static fallback ensures the app works without an OpenAI API key,
 * providing pre-computed suitability matrices for all RiskLevel × AssetType
 * combinations.
 */
@Service
public class AiSuitabilityService {

    private static final Logger log = LoggerFactory.getLogger(AiSuitabilityService.class);

    private final RiskProfileRepository riskProfileRepository;
    private final AssetMasterRepository assetMasterRepository;

    /** Pre-computed suitability matrix: RiskLevel -> AssetType -> score (0-100) */
    private static final Map<RiskLevel, Map<AssetType, Integer>> SUITABILITY_MATRIX = new HashMap<>();

    static {
        // Conservative investors
        Map<AssetType, Integer> conservative = new EnumMap<>(AssetType.class);
        conservative.put(AssetType.EQUITY, 30);
        conservative.put(AssetType.MUTUAL_FUND, 65);
        conservative.put(AssetType.REIT, 55);
        conservative.put(AssetType.INVIT, 50);
        conservative.put(AssetType.CORPORATE_BOND, 85);
        conservative.put(AssetType.GOVERNMENT_BOND, 95);
        SUITABILITY_MATRIX.put(RiskLevel.CONSERVATIVE, conservative);

        // Moderate investors
        Map<AssetType, Integer> moderate = new EnumMap<>(AssetType.class);
        moderate.put(AssetType.EQUITY, 70);
        moderate.put(AssetType.MUTUAL_FUND, 80);
        moderate.put(AssetType.REIT, 75);
        moderate.put(AssetType.INVIT, 70);
        moderate.put(AssetType.CORPORATE_BOND, 65);
        moderate.put(AssetType.GOVERNMENT_BOND, 60);
        SUITABILITY_MATRIX.put(RiskLevel.MODERATE, moderate);

        // Aggressive investors
        Map<AssetType, Integer> aggressive = new EnumMap<>(AssetType.class);
        aggressive.put(AssetType.EQUITY, 90);
        aggressive.put(AssetType.MUTUAL_FUND, 75);
        aggressive.put(AssetType.REIT, 80);
        aggressive.put(AssetType.INVIT, 85);
        aggressive.put(AssetType.CORPORATE_BOND, 45);
        aggressive.put(AssetType.GOVERNMENT_BOND, 30);
        SUITABILITY_MATRIX.put(RiskLevel.AGGRESSIVE, aggressive);
    }

    public AiSuitabilityService(RiskProfileRepository riskProfileRepository,
                                 AssetMasterRepository assetMasterRepository) {
        this.riskProfileRepository = riskProfileRepository;
        this.assetMasterRepository = assetMasterRepository;
    }

    /**
     * Evaluates suitability of an asset for a given user.
     * Uses static fallback matrix — AI integration placeholder.
     */
    public SuitabilityResponseDTO evaluateSuitability(String userId, String assetId) {
        UUID uid = UUID.fromString(userId);
        UUID aid = UUID.fromString(assetId);

        RiskProfile profile = riskProfileRepository.findByUserId(uid)
                .orElseThrow(() -> new IllegalArgumentException("Risk profile not found for user: " + userId));

        AssetMaster asset = assetMasterRepository.findById(aid)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found: " + assetId));

        return generateStaticSuitability(profile, asset);
    }

    /**
     * Handles general chat queries about assets and investing.
     */
    public AiChatDTO.ChatResponse chat(String userId, String message, String assetId) {
        // Static fallback responses for common queries
        String response = generateChatResponse(message, assetId);

        return AiChatDTO.ChatResponse.builder()
                .response(response)
                .aiGenerated(false)
                .build();
    }

    /**
     * Generates knowledge check questions for pre-investment quiz.
     */
    public AiChatDTO.KnowledgeCheckResponse generateKnowledgeCheck(String assetId) {
        UUID aid = UUID.fromString(assetId);
        AssetMaster asset = assetMasterRepository.findById(aid)
                .orElseThrow(() -> new IllegalArgumentException("Asset not found: " + assetId));

        return generateStaticKnowledgeCheck(asset);
    }

    // ---- Static fallback implementations ----

    private SuitabilityResponseDTO generateStaticSuitability(RiskProfile profile, AssetMaster asset) {
        int score = SUITABILITY_MATRIX
                .getOrDefault(profile.getRiskLevel(), SUITABILITY_MATRIX.get(RiskLevel.MODERATE))
                .getOrDefault(asset.getAssetType(), 50);

        String rating;
        if (score >= 70) rating = "SUITABLE";
        else if (score >= 45) rating = "MODERATE_FIT";
        else rating = "NOT_SUITABLE";

        String explanation = buildExplanation(profile, asset, score, rating);
        List<String> riskFactors = buildRiskFactors(asset);
        List<String> benefits = buildBenefits(asset, profile);

        return SuitabilityResponseDTO.builder()
                .suitabilityRating(rating)
                .suitabilityScore(score)
                .explanation(explanation)
                .riskFactors(riskFactors)
                .benefits(benefits)
                .aiGenerated(false)
                .assetName(asset.getName())
                .userRiskLevel(profile.getRiskLevel().name())
                .build();
    }

    private String buildExplanation(RiskProfile profile, AssetMaster asset, int score, String rating) {
        StringBuilder sb = new StringBuilder();

        sb.append("Based on your ").append(profile.getRiskLevel().name().toLowerCase())
          .append(" risk profile");

        if (profile.getInvestmentHorizonYears() != null) {
            sb.append(" and ").append(profile.getInvestmentHorizonYears()).append("-year investment horizon");
        }

        sb.append(", ").append(asset.getName()).append(" ");

        switch (rating) {
            case "SUITABLE":
                sb.append("is a strong match for your portfolio. ");
                sb.append("This ").append(formatAssetType(asset.getAssetType()));
                sb.append(" aligns well with your risk tolerance and investment goals. ");
                if (asset.getYieldPercent() != null) {
                    sb.append("The current yield of ").append(asset.getYieldPercent())
                      .append("% provides attractive income potential. ");
                }
                break;
            case "MODERATE_FIT":
                sb.append("has a moderate fit with your profile. ");
                sb.append("While this ").append(formatAssetType(asset.getAssetType()));
                sb.append(" offers some benefits, there are aspects that may not perfectly align ");
                sb.append("with your risk preferences. Consider allocating only a small portion of your portfolio. ");
                break;
            case "NOT_SUITABLE":
                sb.append("may not be ideal for your current risk profile. ");
                sb.append("This ").append(formatAssetType(asset.getAssetType()));
                sb.append(" carries risk characteristics that don't align well with a ");
                sb.append(profile.getRiskLevel().name().toLowerCase()).append(" investment approach. ");
                break;
        }

        sb.append("\n\nSuitability Score: ").append(score).append("/100");
        return sb.toString();
    }

    private List<String> buildRiskFactors(AssetMaster asset) {
        List<String> risks = new ArrayList<>();
        switch (asset.getAssetType()) {
            case EQUITY:
                risks.add("Market volatility risk — equity prices can fluctuate significantly");
                risks.add("Sector concentration risk if over-allocated");
                risks.add("No guaranteed returns unlike fixed-income instruments");
                break;
            case REIT:
                risks.add("Real estate market cyclicality");
                risks.add("Interest rate sensitivity — rising rates may impact valuations");
                risks.add("Liquidity may be lower than equities");
                break;
            case INVIT:
                risks.add("Infrastructure project execution risk");
                risks.add("Regulatory and policy changes in the infrastructure sector");
                risks.add("Long gestation periods for new projects");
                break;
            case CORPORATE_BOND:
                risks.add("Credit risk — issuer's ability to service debt");
                risks.add("Interest rate risk — bond prices inversely related to rates");
                risks.add("Lower liquidity compared to government securities");
                break;
            case GOVERNMENT_BOND:
                risks.add("Interest rate risk — price sensitivity to rate changes");
                risks.add("Inflation risk — returns may not beat inflation");
                break;
            default:
                risks.add("Market risk inherent to all financial instruments");
        }
        return risks;
    }

    private List<String> buildBenefits(AssetMaster asset, RiskProfile profile) {
        List<String> benefits = new ArrayList<>();
        if (asset.getYieldPercent() != null) {
            benefits.add("Regular income through " + asset.getYieldPercent() + "% yield");
        }
        if (asset.getIsAlternateAsset()) {
            benefits.add("Portfolio diversification beyond traditional equities");
        }
        switch (asset.getAssetType()) {
            case REIT:
                benefits.add("Exposure to commercial real estate without direct ownership");
                benefits.add("SEBI-regulated with mandatory 90% income distribution");
                break;
            case INVIT:
                benefits.add("Exposure to large-scale infrastructure assets");
                benefits.add("Stable cash flows from operational infrastructure");
                break;
            case CORPORATE_BOND:
                benefits.add("Higher yield than government securities");
                benefits.add("Fixed income stream with defined maturity");
                break;
            case GOVERNMENT_BOND:
                benefits.add("Sovereign guarantee — virtually zero credit risk");
                benefits.add("Highly liquid in secondary market");
                break;
            default:
                benefits.add("Potential for capital appreciation");
        }
        return benefits;
    }

    private String generateChatResponse(String message, String assetId) {
        String lower = message != null ? message.toLowerCase() : "";

        if (lower.contains("reit") || lower.contains("real estate")) {
            return "REITs (Real Estate Investment Trusts) are SEBI-regulated instruments that let you invest " +
                   "in commercial real estate without buying property directly. In India, REITs like Mindspace " +
                   "and Embassy Office Parks own Grade A office spaces and distribute 90% of rental income as " +
                   "dividends. They typically offer 6-8% yields with potential capital appreciation. " +
                   "Think of it as 'rent income without the headache of being a landlord'! 🏢\n\n" +
                   "Kya aap apne portfolio mein real estate exposure add karna chahte hain?";
        } else if (lower.contains("invit") || lower.contains("infrastructure")) {
            return "InvITs (Infrastructure Investment Trusts) work similarly to REITs but for infrastructure " +
                   "assets like highways, power transmission lines, and telecom towers. Notable Indian InvITs " +
                   "include PowerGrid InvIT and IRB InvIT. They offer stable cash flows from long-term " +
                   "operational assets with yields of 8-12%. " +
                   "Infrastructure India ki growth story ka backbone hai! 🛣️";
        } else if (lower.contains("bond") || lower.contains("fixed income")) {
            return "Corporate bonds are debt instruments issued by companies. They offer higher returns than " +
                   "FDs (typically 8-10% for AA-rated bonds) but carry credit risk. Always check the issuer's " +
                   "credit rating — AAA is safest, BBB and below is risky. HDFC, ICICI, and Bajaj Finance " +
                   "regularly issue high-quality bonds. " +
                   "FD se better returns chahiye? Corporate bonds explore karo! 💰";
        } else if (lower.contains("risk") || lower.contains("safe")) {
            return "Risk management is crucial for portfolio health. The general rule: diversify across asset " +
                   "classes (equity, debt, real estate), sectors, and time horizons. For conservative investors, " +
                   "60-70% in debt + 20-30% in equity is common. Aggressive investors might go 70% equity + " +
                   "20% alternate assets + 10% debt. " +
                   "Apna risk profile check karo and accordingly invest karo! 📊";
        } else {
            return "I can help you understand different investment options available in the Indian market. " +
                   "You can ask me about:\n" +
                   "• REITs — Real estate investing without buying property\n" +
                   "• InvITs — Infrastructure asset investments\n" +
                   "• Corporate Bonds — Fixed income with higher yields\n" +
                   "• Risk Assessment — Understanding your risk profile\n\n" +
                   "Koi specific asset ya investment question hai? Puchho! 🚀";
        }
    }

    private AiChatDTO.KnowledgeCheckResponse generateStaticKnowledgeCheck(AssetMaster asset) {
        List<AiChatDTO.KnowledgeCheckResponse.Question> questions = new ArrayList<>();

        switch (asset.getAssetType()) {
            case REIT:
                questions.add(AiChatDTO.KnowledgeCheckResponse.Question.builder()
                        .question("What percentage of net distributable cash flow must a REIT distribute to unitholders?")
                        .options(List.of("50%", "75%", "90%", "100%"))
                        .correctIndex(2)
                        .explanation("SEBI mandates that REITs distribute at least 90% of their net distributable cash flow to unitholders.")
                        .build());
                questions.add(AiChatDTO.KnowledgeCheckResponse.Question.builder()
                        .question("What is the primary source of income for a REIT?")
                        .options(List.of("Stock dividends", "Rental income from properties", "Interest from bonds", "Capital gains from trading"))
                        .correctIndex(1)
                        .explanation("REITs primarily earn income through rental payments from tenants of their commercial properties.")
                        .build());
                questions.add(AiChatDTO.KnowledgeCheckResponse.Question.builder()
                        .question("Which of these is a key risk associated with REIT investments?")
                        .options(List.of("Currency risk", "Interest rate sensitivity", "Agricultural commodity prices", "Cryptocurrency volatility"))
                        .correctIndex(1)
                        .explanation("REITs are sensitive to interest rate changes — rising rates can increase borrowing costs and make bonds more attractive relative to REITs.")
                        .build());
                break;
            case INVIT:
                questions.add(AiChatDTO.KnowledgeCheckResponse.Question.builder()
                        .question("What type of assets do InvITs typically invest in?")
                        .options(List.of("Residential apartments", "Infrastructure like highways and power lines", "Agricultural land", "Retail shops"))
                        .correctIndex(1)
                        .explanation("InvITs invest in operational infrastructure assets such as highways, power transmission lines, and telecom towers.")
                        .build());
                questions.add(AiChatDTO.KnowledgeCheckResponse.Question.builder()
                        .question("What is the typical yield range for Indian InvITs?")
                        .options(List.of("2-4%", "5-7%", "8-12%", "15-20%"))
                        .correctIndex(2)
                        .explanation("Indian InvITs typically offer yields in the 8-12% range from stable cash flows of operational infrastructure assets.")
                        .build());
                questions.add(AiChatDTO.KnowledgeCheckResponse.Question.builder()
                        .question("Can you lose your entire investment in an InvIT?")
                        .options(List.of("No, it's guaranteed by the government", "Yes, like any market-linked instrument", "No, SEBI guarantees returns", "Only if the InvIT is delisted"))
                        .correctIndex(1)
                        .explanation("InvITs are market-linked instruments and carry risks. While operational assets provide stability, the market price can decline significantly.")
                        .build());
                break;
            default: // Bonds and other
                questions.add(AiChatDTO.KnowledgeCheckResponse.Question.builder()
                        .question("What does a bond's credit rating indicate?")
                        .options(List.of("The bond's return potential", "The issuer's ability to repay", "The bond's maturity date", "The market interest rate"))
                        .correctIndex(1)
                        .explanation("A credit rating assesses the issuer's creditworthiness and ability to make timely interest and principal payments.")
                        .build());
                questions.add(AiChatDTO.KnowledgeCheckResponse.Question.builder()
                        .question("What happens to bond prices when interest rates rise?")
                        .options(List.of("They increase", "They decrease", "They stay the same", "They become zero"))
                        .correctIndex(1)
                        .explanation("Bond prices have an inverse relationship with interest rates — when rates rise, existing bonds with lower rates become less attractive, reducing their market price.")
                        .build());
                questions.add(AiChatDTO.KnowledgeCheckResponse.Question.builder()
                        .question("What is the minimum investment typically required for corporate bonds in India?")
                        .options(List.of("₹100", "₹1,000", "₹10,000", "₹1,00,000"))
                        .correctIndex(2)
                        .explanation("Corporate bonds in India typically have a face value of ₹10,000 per bond, though online platforms may offer fractional access.")
                        .build());
        }

        return AiChatDTO.KnowledgeCheckResponse.builder()
                .assetName(asset.getName())
                .questions(questions)
                .build();
    }

    private String formatAssetType(AssetType type) {
        return switch (type) {
            case EQUITY -> "equity stock";
            case MUTUAL_FUND -> "mutual fund";
            case REIT -> "Real Estate Investment Trust (REIT)";
            case INVIT -> "Infrastructure Investment Trust (InvIT)";
            case CORPORATE_BOND -> "corporate bond";
            case GOVERNMENT_BOND -> "government bond";
        };
    }
}
