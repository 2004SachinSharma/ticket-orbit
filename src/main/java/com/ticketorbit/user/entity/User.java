package com.ticketorbit.user.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Setter
@Getter
@Entity
@Table(name = "users")
public class User {

@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

@Column(name = "name", nullable = false, length = 100)
private String name;

@Column(name = "email",unique = true, nullable = false, length = 255)
private String email;

@Column(name = "password_hash", nullable = false, length = 255)
private String passwordHash;

@Enumerated(EnumType.STRING)
@Column(name = "role", nullable = false, length = 20)
private Role role;

@Column(name = "active", nullable = false)
private boolean active = true;

@CreationTimestamp
@Column(name = "created_at", nullable = false, updatable = false)
private OffsetDateTime createdAt;

}
