package com.messmate.controller;

import com.messmate.entity.MenuItem;
import com.messmate.service.MenuItemService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/menu-items")
public class MenuItemController {

    private final MenuItemService menuItemService;

    public MenuItemController(MenuItemService menuItemService) {
        this.menuItemService = menuItemService;
    }

    // CREATE
    @PostMapping
    public MenuItem createMenu(
            @Valid @RequestBody MenuItem menuItem) {

        return menuItemService.createMenu(menuItem);
    }

    // READ ALL
    @GetMapping
    public List<MenuItem> getAllMenus() {
        return menuItemService.getAllMenus();
    }

    // READ ONE
    @GetMapping("/{id}")
    public MenuItem getMenuById(@PathVariable Long id) {
        return menuItemService.getMenuById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public MenuItem updateMenu(
            @PathVariable Long id,
            @Valid @RequestBody MenuItem menuItem) {

        return menuItemService.updateMenu(id, menuItem);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteMenu(@PathVariable Long id) {

        menuItemService.deleteMenu(id);

        return "Menu item deleted successfully";
    }
}