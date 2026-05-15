export interface Product {
    id: number;
    nombre: string;
    vendedor: string;
    marca: string;
    modelo: string;
    precio: number;
    stock: number;
    imagen: string;
    // Campos extra para el detalle (id individual)
    descripcion?: string;
    especificaciones?: string;
    garantia?: string;
}

export const MOCK_PRODUCTS: Product[] = [
    { id: 1, nombre: "NVIDIA GeForce RTX 4090", vendedor: "CoreHardware", marca: "ASUS", modelo: "ROG Strix", precio: 2850000, stock: 3, imagen: "https://dlcdnwebimgs.asus.com/gain/3C3857BA-6F60-466A-911E-F32E278B3F48/v8/w800" },
    { id: 2, nombre: "Procesador Intel Core i9-14900K", vendedor: "CoreHardware", marca: "Intel", modelo: "Raptor Lake", precio: 950000, stock: 10, imagen: "https://www.venex.com.ar/products_images/1697641215_i9.png" },
    { id: 3, nombre: "Memoria RAM 32GB DDR5 6000MHz", vendedor: "CoreHardware", marca: "Corsair", modelo: "Vengeance RGB", precio: 220000, stock: 15, imagen: "https://m.media-amazon.com/images/I/61S6hU5X9TL._AC_SL1500_.jpg" },
    { id: 4, nombre: "Motherboard Z790 AORUS ELITE", vendedor: "CoreHardware", marca: "Gigabyte", modelo: "AX ICE", precio: 450000, stock: 5, imagen: "https://static.gigabyte.com/StaticFile/Image/Global/0861183c076f7f6a8b7a4f9d6c7e3a2b/Product/37021/png/1000" },
    { id: 5, nombre: "SSD M.2 NVMe 2TB Gen4", vendedor: "CoreHardware", marca: "Samsung", modelo: "990 Pro", precio: 310000, stock: 8, imagen: "https://m.media-amazon.com/images/I/71Yf9Lp3xOL._AC_SL1500_.jpg" },
    { id: 6, nombre: "Fuente 1000W 80+ Gold Modular", vendedor: "CoreHardware", marca: "EVGA", modelo: "SuperNOVA GT", precio: 280000, stock: 4, imagen: "https://images.evga.com/products/gallery/220-GT-1000-X1_LG_1.jpg" },
    { id: 7, nombre: "Gabinete Mid-Tower Flow", vendedor: "CoreHardware", marca: "NZXT", modelo: "H7 Elite", precio: 195000, stock: 6, imagen: "https://m.media-amazon.com/images/I/71wK8u-1p6L._AC_SL1500_.jpg" },
    { id: 8, nombre: "Monitor 27' QHD 165Hz IPS", vendedor: "CoreHardware", marca: "LG", modelo: "UltraGear", precio: 620000, stock: 12, imagen: "https://www.lg.com/ar/images/monitores/md07553106/gallery/D-01.jpg" },
    { id: 9, nombre: "Water Cooling 360mm RGB", vendedor: "CoreHardware", marca: "Cooler Master", modelo: "MasterLiquid", precio: 175000, stock: 9, imagen: "https://m.media-amazon.com/images/I/71-U6Z8N8HL._AC_SL1500_.jpg" },
    { id: 10, nombre: "Mouse Inalámbrico Gaming", vendedor: "CoreHardware", marca: "Logitech", modelo: "G Pro X Superlight", precio: 155000, stock: 20, imagen: "https://resource.logitechg.com/w_692,c_lpad,ar_4:3,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/gaming/en/products/g-pro-x-superlight/g-pro-x-superlight-black.png" },
    { id: 11, nombre: "Teclado Mecánico 60% RGB", vendedor: "CoreHardware", marca: "HyperX", modelo: "Alloy Origins 60", precio: 98000, stock: 14, imagen: "https://m.media-amazon.com/images/I/61NlB8q6ZBL._AC_SL1500_.jpg" },
    { id: 12, nombre: "Auriculares Wireless 7.1", vendedor: "CoreHardware", marca: "Razer", modelo: "BlackShark V2 Pro", precio: 185000, stock: 11, imagen: "https://assets2.razerzone.com/images/pnx.assets/d2cc36e2f0724814d4e3f28d8b6715f3/razer-blackshark-v2-pro-2023-black-500x500.png" },
    { id: 13, nombre: "Disco Rígido 8TB SATA3", vendedor: "CoreHardware", marca: "Seagate", modelo: "IronWolf", precio: 240000, stock: 7, imagen: "https://m.media-amazon.com/images/I/81S7mO2j3TL._AC_SL1500_.jpg" },
    { id: 14, nombre: "Pasta Térmica Alta Performance", vendedor: "CoreHardware", marca: "Arctic", modelo: "MX-6", precio: 12000, stock: 50, imagen: "https://m.media-amazon.com/images/I/51AAs-6C23L._AC_SL1000_.jpg" },
    { id: 15, nombre: "Procesador AMD Ryzen 7 7800X3D", vendedor: "CoreHardware", marca: "AMD", modelo: "Zen 4", precio: 780000, stock: 8, imagen: "https://www.venex.com.ar/products_images/1681232454_amd-ryzen-7-7800x3d.png" },
    { id: 16, nombre: "Placa de Video RX 7900 XTX", vendedor: "CoreHardware", marca: "Sapphire", modelo: "Pulse", precio: 1850000, stock: 4, imagen: "https://m.media-amazon.com/images/I/71Y86xK+l7L._AC_SL1500_.jpg" },
    { id: 17, nombre: "Silla Gamer Ergonómica", vendedor: "CoreHardware", marca: "Corsair", modelo: "T3 Rush", precio: 420000, stock: 3, imagen: "https://m.media-amazon.com/images/I/71S-R1W2NCL._AC_SL1500_.jpg" },
    { id: 18, nombre: "Micrófono Condensador USB", vendedor: "CoreHardware", marca: "Blue", modelo: "Yeti GX", precio: 140000, stock: 10, imagen: "https://m.media-amazon.com/images/I/61iXfV3r4uL._AC_SL1500_.jpg" },
    { id: 19, nombre: "Router WiFi 6 Gaming", vendedor: "CoreHardware", marca: "TP-Link", modelo: "Archer AX11000", precio: 390000, stock: 5, imagen: "https://m.media-amazon.com/images/I/61S7z0Y5OUL._AC_SL1500_.jpg" },
    { id: 20, nombre: "Cámara Web 4K Pro", vendedor: "CoreHardware", marca: "Logitech", modelo: "Brio", precio: 210000, stock: 12, imagen: "https://m.media-amazon.com/images/I/61u9K-X9iSL._AC_SL1500_.jpg" },
    { id: 21, nombre: "Controlador Fan Hub RGB", vendedor: "CoreHardware", marca: "Lian Li", modelo: "Uni Hub", precio: 45000, stock: 25, imagen: "https://m.media-amazon.com/images/I/61q3Y2Y7Y7L._AC_SL1500_.jpg" },
    { id: 22, nombre: "Cable Extensiones Sleeved", vendedor: "CoreHardware", marca: "Lian Li", modelo: "Strimer Plus V2", precio: 85000, stock: 15, imagen: "https://m.media-amazon.com/images/I/61X-jUu5qYL._AC_SL1200_.jpg" },
    { id: 23, nombre: "Capturadora de Video 4K60", vendedor: "CoreHardware", marca: "Elgato", modelo: "4K60 Pro", precio: 320000, stock: 4, imagen: "https://m.media-amazon.com/images/I/71rIe7p9r8L._AC_SL1500_.jpg" },
    { id: 24, nombre: "Pad Térmico 120x120", vendedor: "CoreHardware", marca: "Thermal Grizzly", modelo: "Minus Pad 8", precio: 18000, stock: 30, imagen: "https://m.media-amazon.com/images/I/61l6-V6S7zL._AC_SL1000_.jpg" },
    { id: 25, nombre: "Soporte GPU Vertical", vendedor: "CoreHardware", marca: "Cooler Master", modelo: "V3 Kit", precio: 65000, stock: 8, imagen: "https://m.media-amazon.com/images/I/61xR0Y-f7OL._AC_SL1500_.jpg" },
];