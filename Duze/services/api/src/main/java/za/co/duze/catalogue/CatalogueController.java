package za.co.duze.catalogue;

import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/v1/merchants")
public class CatalogueController {
    private final JdbcClient jdbc;
    public CatalogueController(JdbcClient jdbc) { this.jdbc = jdbc; }

    public record Merchant(UUID id, String name, String description, String category,
                           String serviceStatus, int prepMinutes, UUID zoneId) {}
    public record MenuItem(UUID id, String name, String description, int priceCents, boolean available) {}
    public record Menu(Merchant merchant, List<MenuItem> items) {}

    private static final String MERCHANT_SELECT = """
        SELECT m.id, m.name, m.description, m.catalogue_category AS category,
               m.service_status AS service_status, m.estimated_prep_minutes AS prep_minutes,
               m.delivery_zone_id AS zone_id
        FROM merchants m JOIN delivery_zones z ON z.id = m.delivery_zone_id
        WHERE m.status = 'APPROVED' AND z.status = 'ACTIVE'
        """;

    @GetMapping
    public List<Merchant> merchants(@RequestParam(defaultValue = "") String query,
                                    @RequestParam(defaultValue = "") String category,
                                    @RequestParam(required = false) UUID zoneId) {
        if (query.length() > 120 || category.length() > 40) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Search is too long");
        }
        var sql = MERCHANT_SELECT + """
            AND (:query = '' OR strpos(lower(m.name || ' ' || coalesce(m.description, '')), lower(:query)) > 0
              OR EXISTS (SELECT 1 FROM menu_items i WHERE i.merchant_id=m.id
                  AND NOT i.is_age_restricted AND strpos(lower(i.name), lower(:query)) > 0))
            AND (:category = '' OR m.catalogue_category = :category)
            """;
        if (zoneId != null) sql += " AND m.delivery_zone_id = :zoneId";
        var statement = jdbc.sql(sql + " ORDER BY m.name LIMIT 100").param("query", query.strip()).param("category", category);
        if (zoneId != null) statement = statement.param("zoneId", zoneId);
        return statement.query(Merchant.class).list();
    }

    @GetMapping("/{id}/menu")
    public Menu menu(@PathVariable UUID id) {
        Merchant merchant = jdbc.sql(MERCHANT_SELECT + " AND m.id = :id").param("id", id)
                .query(Merchant.class).optional()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kitchen not found"));
        var items = jdbc.sql("""
            SELECT id, name, description, price_cents, is_available AS available FROM menu_items
            WHERE merchant_id = :id AND NOT is_age_restricted ORDER BY name
            """).param("id", id).query(MenuItem.class).list();
        return new Menu(merchant, items);
    }
}
