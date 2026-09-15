package za.co.duze.catalogue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@EnabledIfEnvironmentVariable(named = "DUZE_INTEGRATION_TESTS", matches = "true")
class CatalogueIntegrationTest {
    @Autowired MockMvc mvc;
    @Autowired JdbcTemplate jdbc;
    private UUID merchant;
    private UUID zone;

    @BeforeEach void fixture() {
        UUID user = UUID.randomUUID(); zone = UUID.randomUUID(); merchant = UUID.randomUUID(); UUID category = UUID.randomUUID();
        jdbc.update("INSERT INTO users(id,email,password_hash,full_name,role) VALUES (?,?,'unusable','Test Owner','MERCHANT')", user, user+"@test.invalid");
        jdbc.update("INSERT INTO delivery_zones(id,name,center_latitude,center_longitude,radius_km,base_fee_cents,per_km_fee_cents) VALUES (?,'Test Zone',-30.15,30.07,5,1500,450)", zone);
        jdbc.update("INSERT INTO merchants(id,owner_user_id,delivery_zone_id,name,description,status,service_status,street_address,latitude,longitude) VALUES (?,?,?,'Test Kitchen','Local food','APPROVED','OPEN','Test Road',-30.15,30.07)", merchant,user,zone);
        jdbc.update("INSERT INTO categories(id,merchant_id,name) VALUES (?,?,'Test Plates')", category,merchant);
        jdbc.update("INSERT INTO menu_items(merchant_id,category_id,name,price_cents,is_available) VALUES (?,?,'Test Pap',2500,true),(?,?,'Sold Out Plate',5500,false)",merchant,category,merchant,category);
        jdbc.update("INSERT INTO menu_items(merchant_id,category_id,name,price_cents,is_age_restricted) VALUES (?,?,'Restricted Drink',4500,true)",merchant,category);
    }
    @Test void publicCatalogueAndMenuUseDatabasePrices() throws Exception {
        mvc.perform(get("/api/v1/merchants").param("zoneId",zone.toString()))
                .andExpect(status().isOk()).andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].name").value("Test Kitchen"));
        mvc.perform(get("/api/v1/merchants/{id}/menu",merchant))
                .andExpect(status().isOk()).andExpect(jsonPath("$.items.length()").value(2))
                .andExpect(jsonPath("$.items[0].available").value(false))
                .andExpect(jsonPath("$.items[1].priceCents").value(2500));
    }
    @Test void suspendedMerchantIsConcealed() throws Exception {
        jdbc.update("UPDATE merchants SET status='SUSPENDED' WHERE id=?",merchant);
        mvc.perform(get("/api/v1/merchants").param("zoneId",zone.toString())).andExpect(jsonPath("$.length()").value(0));
        mvc.perform(get("/api/v1/merchants/{id}/menu",merchant)).andExpect(status().isNotFound());
    }
    @Test void pausedZoneIsConcealed() throws Exception {
        jdbc.update("UPDATE delivery_zones SET status='PAUSED' WHERE id=?",zone);
        mvc.perform(get("/api/v1/merchants/{id}/menu",merchant)).andExpect(status().isNotFound());
    }
    @Test void dishSearchExcludesRestrictedItemsAndTreatsSqlAsText() throws Exception {
        mvc.perform(get("/api/v1/merchants").param("zoneId",zone.toString()).param("query","Test Pap")).andExpect(jsonPath("$.length()").value(1));
        for (String query : new String[]{"Restricted Drink", "' OR 1=1 --", "%"}) {
            mvc.perform(get("/api/v1/merchants").param("zoneId",zone.toString()).param("query",query)).andExpect(jsonPath("$.length()").value(0));
        }
        mvc.perform(get("/api/v1/merchants").param("zoneId",zone.toString()).param("category","Stores")).andExpect(jsonPath("$.length()").value(0));
    }
    @Test void invalidInputsAndUnknownMerchantAreHandled() throws Exception {
        mvc.perform(get("/api/v1/merchants").param("query","a".repeat(121))).andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/merchants/invalid/menu")).andExpect(status().isBadRequest());
        mvc.perform(get("/api/v1/merchants/{id}/menu",UUID.randomUUID())).andExpect(status().isNotFound());
    }
    @Test void nonPublicRoutesAndMutationsRemainClosed() throws Exception {
        mvc.perform(get("/api/v1/admin/orders")).andExpect(status().isUnauthorized());
        mvc.perform(post("/api/v1/merchants")).andExpect(status().isForbidden());
    }
}
