import { Supplier } from '../types/orders';

export const DEFAULT_BOSS_PHONE = '34670835948';

type RawCatalog = {
  nombre: string;
  tel: string;
  secciones: {
    label: string | null;
    productos: [string | null, string][];
  }[];
}[];

const RAW_DEFAULT_CATALOG: RawCatalog = [
  {
    nombre: 'Tokyo-ya',
    tel: '34680901400',
    secciones: [
      {
        label: 'Comida',
        productos: [
          ['090111', 'Utage Rice'],
          ['101803', 'Katsuo Bushi Standard'],
          ['0616A', 'Golden Curry Hot'],
          ['0371A', 'Okonomi Sauce'],
          ['0370B', 'Yakisoba Sauce'],
          ['142206', 'Takuan Ipponzuke 500g'],
          ['1472', 'Takuan Ipponzuke 350g'],
          ['1014', 'Aonoriko'],
          ['0451', 'Itacho Shiro'],
          ['077240', 'Mayonesa'],
          ['XL20912', 'Ajinomoto'],
          ['XL21016', 'Katakuriko'],
          ['057302', 'Kome Su Uchibori Pro'],
          ['0311B', 'Yamasa Shoyu 18L'],
          ['0398', 'Kikkoman Shoyu 20L'],
          ['071201', 'Kona Wasabi'],
          ['092402', 'Panko Marrón 6mm'],
          ['150002', 'Salsa Sriracha'],
          ['150078', 'Salsa de Ostras'],
          ['0533', 'Goma Dressing'],
          ['142202', 'Beni Shoga Sengiri'],
          ['1459', 'Umeboshi Pet'],
          ['1095', 'Yakinori Premium'],
          ['141044', 'Gari Shiro'],
          ['115094', 'Masago Arare'],
          ['C-909', 'Masago Yuzu'],
          ['C-KHY-038', 'Ikura Keta'],
          ['C-NTC001', 'Unagi Kabayaki'],
          ['C-TK004', 'Ebi Fry 3L'],
          ['C-105', 'Edamame'],
          ['C-352', 'Pan Bao'],
          ['C-AJ0002', 'Yasai Gyoza'],
          ['C-AJ0001A', 'Gyoza Tori & Yasai'],
          ['C-AJ0022', 'Gyoza Duck'],
          ['C-AJ0026', 'Ebi Gyoza'],
          ['C-953', 'Kaki Furai S'],
          ['US020', 'Momen Tofu'],
          ['C-WA503', 'Dorayaki Chocolate'],
          ['C-DL001', 'Bracitos Té y Azuki'],
          ['055002', 'Ryorishu Sake Cocinar'],
          ['055001', 'Mirin Fu'],
          ['AI-PS053', 'Pasta de Ají Amarillo'],
          ['159222', 'Salsa Tartufata'],
          ['091701', 'Tempura Ko Age Jyozu'],
          ['075711', 'Dashi No Moto'],
          ['1021', 'Dashi Kombu'],
          ['S-094', 'Teppo Gushi 120mm'],
          ['S-095', 'Teppo Gushi 150mm'],
          ['BUT-01', 'Cartucho Gas B-250'],
        ],
      },
      {
        label: 'Menaje',
        productos: [
          ['E-141', 'Bandeja Donburi Bowl'],
          ['E-225', 'Bandeja 165x114'],
          ['E-228', 'Bandeja 230x156'],
          ['GUI-029', 'Tarrina'],
          ['GUI-030', 'Tapa'],
        ],
      },
      {
        label: 'Bebidas',
        productos: [
          ['D-034', 'Sapporo'],
          ['D-035', 'Sapporo Premium Can'],
          ['D-249', 'Asahi'],
          ['D-155', 'Kirin'],
          ['D-156', 'Kirin Free'],
          ['D-218', 'Owa Beer'],
          ['D-214', 'Kuro Owa'],
          ['D-4583B', 'Raifuku Junmaiginjo'],
          ['D-354B', 'Ichinokura Himezen'],
          ['D-581C', 'Kubota Junmai Daiginjo'],
          ['JF1323', 'Ramune'],
          ['JF1305', 'Ramune Fresa'],
          ['CHO-01', 'Choya Umeshu Original'],
        ],
      },
    ],
  },
  {
    nombre: 'Yamaaoi',
    tel: '34682902524',
    secciones: [{ label: null, productos: [[null, 'Wasabi 250gr']] }],
  },
  {
    nombre: 'Pelayo Iberdeli',
    tel: '34628139585',
    secciones: [
      {
        label: null,
        productos: [[null, 'PICANHA WAGYU A5']],
      },
    ],
  },
  {
    nombre: 'Yuzu pastri',
    tel: '34644871002',
    secciones: [
      {
        label: null,
        productos: [
          [null, 'Chocolate'],
          [null, 'Kinder'],
          [null, 'Cheesecake'],
          [null, 'Pistacho'],
          [null, 'Mango'],
          [null, 'Caramelo salado'],
        ],
      },
    ],
  },
  {
    nombre: 'Román y Martos',
    tel: '34637479461',
    secciones: [
      {
        label: null,
        productos: [
          [null, 'Salmón 6/7'],
          [null, 'Salmón 7/8'],
          [null, 'Lubina 800/900'],
          [null, 'Lubina 1400/1800'],
          [null, 'Hamachi 1300/2000'],
          [null, 'Hamachi 3000/4000'],
          [null, 'Pulpo 4kg~'],
        ],
      },
    ],
  },
  {
    nombre: 'Cominport',
    tel: '34669434101',
    secciones: [
      {
        label: null,
        productos: [
          ['204420', 'Nabo amarillo'],
          ['204383', 'Unagi'],
          ['203308', 'Ebi fry'],
          ['201686', 'Palillos'],
          [null, 'Atún rojo akami'],
          [null, 'Atún rojo chutoro'],
          [null, 'Atún rojo otoro'],
          [null, 'Salmón fresco'],
          [null, 'Sésamo dorado'],
          [null, 'Sésamo negro'],
        ],
      },
    ],
  },
  {
    nombre: 'Dacrisa',
    tel: '34678299466',
    secciones: [
      {
        label: null,
        productos: [
          [null, 'Contramuslo de pollo'],
          [null, 'Pechuga de pollo'],
          [null, 'Panceta de cerdo con piel'],
          [null, 'Solomillo de ternera'],
          [null, 'Lomo bajo de ternera'],
          [null, 'Huevos'],
        ],
      },
    ],
  },
  {
    nombre: 'Victoria',
    tel: '34670835948',
    secciones: [
      {
        label: null,
        productos: [
          [null, 'Barril Victoria 30L'],
          [null, 'Caja Victoria 33cl'],
          [null, 'Caja Victoria sin 33cl'],
          [null, 'Caja Daura sin gluten'],
          [null, 'Caja Nestea'],
          [null, 'Caja agua liviana 50cl'],
          [null, 'Caja agua gas Pirinea 50cl'],
          [null, 'Caja agua liviana plástico llevar'],
          [null, 'Botellas vino tinto Cueva de Lobos'],
          [null, 'Botellas vino blanco Cueva de Lobos'],
          [null, 'Botellas vino rosado Cueva de Lobos'],
          [null, 'Botellas vino verdejo Finca de los Trenzones'],
          [null, 'Botellas vino tinto ribera Pozo de Nieve'],
          [null, 'Botellas vino blanco Chardonnay Viñas del Vero'],
          [null, 'Botellas vino blanc Pescador aguja'],
          [null, 'Kg Café normal'],
          [null, 'Kg Café descafeinado'],
          [null, 'Caja Azúcar'],
          [null, 'Caja Sacarina'],
          [null, 'Caja leche sin lactosa'],
          [null, 'Caja leche avena'],
          [null, 'Botellas casera limón'],
          [null, 'Botellas casera blanca'],
          [null, 'Garrafa 5L Agua'],
          [null, 'Cocacola 2L'],
          [null, 'Cocacola zero 2L'],
        ],
      },
    ],
  },
  {
    nombre: 'Coca Cola',
    tel: '34670835948',
    secciones: [
      {
        label: null,
        productos: [
          [null, 'Caja Coca Cola'],
          [null, 'Caja Coca Cola Zero'],
          [null, 'Caja Coca Cola Zero Zero'],
          [null, 'Caja Fanta naranja'],
          [null, 'Caja Fanta limón'],
          [null, 'Caja Aquarius naranja'],
          [null, 'Caja Coca Cola plástico'],
          [null, 'Caja Coca Cola Zero plástico'],
        ],
      },
    ],
  },
  {
    nombre: 'GM Comerco',
    tel: '34670835948',
    secciones: [
      {
        label: null,
        productos: [
          [null, 'Bote té matcha'],
          [null, 'Paquete rollo papel máquina'],
          [null, 'Paquete papel baño'],
          [null, 'Paquete pastillas cisterna'],
          [null, 'Paquete pañuelos'],
          [null, 'Paquete palillos llevar'],
          [null, 'Caja tuppers llevar'],
          [null, 'Paquete tupper salsas'],
          [null, 'Bolsa plástico llevar'],
          [null, 'Bolsa cartón llevar'],
          [null, 'Paquete servilletas mesa'],
        ],
      },
    ],
  },
];

export function convertRawCatalog(raw: RawCatalog): Supplier[] {
  return raw.map((sup, si) => ({
    id: `sup-${si}-${sup.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name: sup.nombre,
    phone: sup.tel,
    sections: sup.secciones.map((sec, sci) => ({
      id: `sec-${si}-${sci}`,
      label: sec.label,
      products: sec.productos.map((prod, pi) => ({
        id: `prod-${si}-${sci}-${pi}`,
        code: prod[0],
        name: prod[1],
      })),
    })),
  }));
}

export function getDefaultSuppliers(): Supplier[] {
  return convertRawCatalog(RAW_DEFAULT_CATALOG);
}

export function createId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}
