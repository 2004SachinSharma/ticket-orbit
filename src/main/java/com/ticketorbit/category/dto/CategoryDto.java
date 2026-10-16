package com.ticketorbit.category.dto;

import com.ticketorbit.category.entity.Category;


public record CategoryDto(Long id, String name) {
	
	public static CategoryDto from(Category category) {
		return new CategoryDto(category.getId(), category.getName());
	}
	
}
