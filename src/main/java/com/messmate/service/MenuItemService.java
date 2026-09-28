package com.messmate.service;

import com.messmate.entity.MenuItem;
import com.messmate.repository.MenuItemRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;

    public MenuItemService(
            MenuItemRepository menuItemRepository) {

        this.menuItemRepository =
                menuItemRepository;
    }

    public MenuItem createMenu(
            MenuItem menuItem) {

        if (menuItem.getId() == null) {

            throw new IllegalArgumentException(
                    "Menu ID is required"
            );
        }

        if (menuItemRepository.existsById(
                menuItem.getId())) {

            throw new IllegalArgumentException(
                    "Menu item with ID "
                            + menuItem.getId()
                            + " already exists"
            );
        }

        return menuItemRepository.save(menuItem);
    }

    public List<MenuItem> getAllMenus() {

        return menuItemRepository.findAll();
    }

    public MenuItem getMenuById(Long id) {

        return menuItemRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Menu item not found with id: "
                                        + id
                        )
                );
    }

    public MenuItem updateMenu(
            Long id,
            MenuItem updatedMenu) {

        MenuItem existing =
                getMenuById(id);

        existing.setWeekStartDate(
                updatedMenu.getWeekStartDate()
        );

        existing.setWeekEndDate(
                updatedMenu.getWeekEndDate()
        );

        return menuItemRepository.save(existing);
    }

    public void deleteMenu(Long id) {

        MenuItem existing =
                getMenuById(id);

        menuItemRepository.delete(existing);
    }
}