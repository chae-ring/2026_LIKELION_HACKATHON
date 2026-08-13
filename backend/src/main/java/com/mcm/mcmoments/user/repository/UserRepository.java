package com.mcm.mcmoments.user.repository;

import com.mcm.mcmoments.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
