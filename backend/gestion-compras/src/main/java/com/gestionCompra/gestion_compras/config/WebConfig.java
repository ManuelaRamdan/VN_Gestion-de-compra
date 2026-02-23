package com.gestionCompra.gestion_compras.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // Inyectamos la variable desde application.properties
    @Value("${pdf.storage.path}")
    private String storagePath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Aseguramos que la ruta termine con una barra para que Spring la resuelva bien como directorio
        String location = "file:" + storagePath + (storagePath.endsWith("/") ? "" : "/");
        
        // Mapea la URL "/api/uploads/**" a la carpeta definida en Docker (/app/pdfs/)
        registry.addResourceHandler("/api/uploads/**")
                .addResourceLocations(location);
    }
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/uploads/**")
                .allowedOrigins("http://localhost:5173") 
                .allowedMethods("GET") 
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}