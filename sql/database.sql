CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- Lácteos, Cárnicos, Frutas y Verduras, Panadería
    lote VARCHAR(30) NOT NULL,
    precio NUMERIC(10, 2) NOT NULL CHECK (precio >= 0),
    stock INTEGER NOT NULL CHECK (stock >= 0),
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vencimiento DATE NOT NULL,
    imagen_url VARCHAR(255) DEFAULT 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400'
);

-- Datos de prueba: ninguno vencido; hay frescos, por vencer y uno agotado
-- La fecha base es 26/11/2026 para que no se vean vencidos en la demo
INSERT INTO productos (nombre, categoria, lote, precio, stock, fecha_vencimiento, imagen_url) VALUES
('Leche Entera Pasteurizada 1L', 'Lácteos', 'LT-2026-01', 4200.00, 35, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '12 days', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'),
('Queso Campesino Fresco 500g', 'Lácteos', 'LT-2026-02', 11500.00, 8, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '2 days', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400'),
('Kumis Campesino 1L', 'Lácteos', 'LT-2026-20', 4800.00, 18, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '9 days', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'),
('Cuajada Paisa 400g', 'Lácteos', 'LT-2026-21', 6800.00, 10, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '6 days', 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400'),
('Crema de Leche 500ml', 'Lácteos', 'LT-2026-22', 7900.00, 22, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '3 days', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'),
('Yogurt Griego Natural', 'Lácteos', 'LT-2026-99', 8500.00, 5, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '4 days', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'),
('Pechuga de Pollo Orgánica 1Kg', 'Cárnicos', 'CR-2026-88', 18900.00, 15, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '5 days', 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400'),
('Chorizo Antioqueño 500g', 'Cárnicos', 'CR-2026-90', 12500.00, 14, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '5 days', 'https://commons.wikimedia.org/wiki/Special:FilePath/Chorizo%20sausage.JPG?width=400'),
('Carne Molida de Res 1Kg', 'Cárnicos', 'CR-2026-91', 15900.00, 9, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '3 days', 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400'),
('Longaniza de Campo 500g', 'Cárnicos', 'CR-2026-92', 9800.00, 0, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '6 days', 'https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400'),
('Fresas Seleccionadas 500g', 'Frutas y Verduras', 'FV-2026-10', 6800.00, 20, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '3 days', 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400'),
('Aguacate Hass 1Kg', 'Frutas y Verduras', 'FV-2026-20', 9500.00, 30, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '7 days', 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400'),
('Banano Criollo (Manojo)', 'Frutas y Verduras', 'FV-2026-21', 3500.00, 40, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '5 days', 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=400'),
('Mango Tommy 1Kg', 'Frutas y Verduras', 'FV-2026-22', 5200.00, 25, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '4 days', 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400'),
('Papa Criolla Lavada 1Kg', 'Frutas y Verduras', 'FV-2026-23', 4200.00, 35, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '14 days', 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400'),
('Limones Tahití 500g', 'Frutas y Verduras', 'FV-2026-24', 2800.00, 28, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '8 days', 'https://commons.wikimedia.org/wiki/Special:FilePath/Limes.jpg?width=400'),
('Pandebono Artesanal (Unidad)', 'Panadería', 'PN-2026-20', 2500.00, 24, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '2 days', 'https://commons.wikimedia.org/wiki/Special:FilePath/Pandebono.jpg?width=400'),
('Almojábana Casera (Unidad)', 'Panadería', 'PN-2026-21', 2200.00, 15, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '2 days', 'https://commons.wikimedia.org/wiki/Special:FilePath/Pandeyuca%2C%20Pandebono%20y%20Almoj%C3%A1bana.%20Colombia.JPG?width=400'),
('Pan Tajado Integral 750g', 'Panadería', 'PN-2026-22', 5500.00, 12, GREATEST(CURRENT_DATE, DATE '2026-11-26') + INTERVAL '7 days', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400');

-- Login del panel: admin / admin123 (clave guardada con password_hash)
CREATE TABLE usuarios_admin (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(50) NOT NULL UNIQUE,
    clave VARCHAR(255) NOT NULL, -- Hash bcrypt generado con password_hash()
    nombre_completo VARCHAR(100) NOT NULL,
    fecha_registro TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO usuarios_admin (usuario, clave, nombre_completo) VALUES
('admin', '$2y$10$4Ca01y1yFYcULnD/b9kf8OKO0hs301QSMPSjcvR1wlSVFUgoMlXtS', 'Administrador General');
