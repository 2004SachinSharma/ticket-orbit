package com.ticketorbit.user.repository;

import com.ticketorbit.user.entity.Role;
import com.ticketorbit.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> , JpaSpecificationExecutor<User> {
 Optional<User> findByEmail(String email);
 List<User> findAllByRole(Role role);
 long countByRoleAndActiveTrue(Role role);
}
