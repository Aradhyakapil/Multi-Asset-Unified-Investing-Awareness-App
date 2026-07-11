package com.wealthwise.repository;

import com.wealthwise.model.RiskProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RiskProfileRepository extends JpaRepository<RiskProfile, UUID> {

    Optional<RiskProfile> findByUserId(UUID userId);
}
