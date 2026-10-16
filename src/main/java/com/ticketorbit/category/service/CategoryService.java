package com.ticketorbit.category.service;

import com.ticketorbit.category.dto.CategoryDto;
import com.ticketorbit.category.entity.Category;
import com.ticketorbit.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
private final CategoryRepository categoryRepository;

public List<CategoryDto> getAllCategories() {
	List<Category> allCategories = categoryRepository.findAll();
	return allCategories.stream()
			       .map(CategoryDto::from)
			       .collect(Collectors.toList());
}

}
