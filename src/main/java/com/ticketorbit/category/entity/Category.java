package com.ticketorbit.category.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
public class Category {

@Id
@GeneratedValue(strategy= GenerationType.IDENTITY)
private Long id;

@Column(name="name", nullable=false, unique=true, length=100)
private String name;

}
