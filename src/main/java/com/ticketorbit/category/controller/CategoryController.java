package com.ticketorbit.category.controller;

import com.ticketorbit.category.dto.CategoryDto;
import com.ticketorbit.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class CategoryController {

private final CategoryService categoryService;

@GetMapping("/categories")
public ResponseEntity<List<CategoryDto>> getAllCategories(){

	return ResponseEntity.ok(categoryService.getAllCategories());

}

}
