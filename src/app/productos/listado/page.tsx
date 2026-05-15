'use client'
import { useState, useEffect } from 'react'
import {
  Box, Flex, IconButton, Image, SimpleGrid, Text,
  Button, Heading, Badge, VStack, Spinner, Center
} from '@chakra-ui/react'
import { FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import Link from 'next/link'
import { getProducts } from '@/services/productService'
import AppNavbar from '@/components/AppNavbar' // Ajustado a la ruta limpia

export default function ListadoProductos() {
  const [data, setData] = useState<{ items: any[], total: number }>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  const colors = {
    bgMain: "#0D1117",
    bgCard: "#161B22",
    accent: "#00D1FF",
    border: "#21262D",
    textMain: "#E6EDF3",
    textMuted: "#8B949E"
  }

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const res = await getProducts({ offset, limit });

        // Si la API o el servicio fallan y devuelven algo raro (null, undefined, etc.)
        // nos aseguramos de setear un objeto válido para que el .map() no explote.
        if (res && res.items) {
          setData(res);
        } else {
          setData({ items: [], total: 0 });
        }

      } catch (error) {
        console.error("Error cargando productos:", error);
        // Si hay un error de red, también reseteamos a un estado seguro
        setData({ items: [], total: 0 });
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [offset, limit]); // Agregué limit aunque es constante

  // LÓGICA DE PAGINACIÓN
  const nextPage = () => {
    if (offset + limit < data.total) {
      setOffset(prev => prev + limit);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevPage = () => {
    setOffset(prev => Math.max(0, prev - limit));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentPage = Math.floor(offset / limit) + 1;

  // --- RENDERS CONDICIONALES ---

  if (loading) {
    return (
      <Box bg={colors.bgMain} minH="100vh">
        <AppNavbar />
        <Center mt={20}>
          <VStack gap={4}>
            <Spinner color={colors.accent} size="xl" borderWidth="4px" />
            <Text color={colors.accent} fontWeight="bold" letterSpacing="widest">CARGANDO HARDWARE...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (data.items?.length === 0) {
    return (
      <Box bg={colors.bgMain} minH="100vh">
        <AppNavbar />
        <Center mt={20} p={10}>
          <VStack gap={6}>
            <Box fontSize="6xl" color={colors.accent}><FaSearch /></Box>
            <Heading size="lg" textAlign="center" color={colors.textMain}>No hay productos disponibles</Heading>
            <Button
              variant="outline"
              borderColor={colors.accent}
              color={colors.accent}
              onClick={() => window.location.reload()}
              borderRadius="full"
              px={10}            
              py={6}             
              fontSize="md"      
              fontWeight="bold"
              _hover={{
                bg: "rgba(0, 209, 255, 0.1)", // Un brillo sutil al pasar el mouse
                transform: "scale(1.05)",
                borderColor: "white",
                color: "white"
              }}
            >
              Reintentar
            </Button>
          </VStack>
        </Center>
      </Box>
    );
  }

  return (
    <Box bg={colors.bgMain} minH="100vh" color={colors.textMain}>
      <AppNavbar />

      {/* BANNER */}
      <Box w="full" px={8} mt={6}>
        <Box
          w="full" h="150px"
          bgGradient="to-r" gradientFrom={colors.bgCard} gradientTo={colors.border}
          borderRadius="2xl" display="flex" alignItems="center" px={12}
          border="1px solid" borderColor={colors.border}
        >
          <VStack align="start" gap="0">
            <Badge variant="outline" colorPalette="cyan" mb={2}>CATÁLOGO OFICIAL</Badge>
            <Heading size="xl">CORE HARDWARE</Heading>
            <Text color={colors.textMuted}>Explorando {data.total} componentes disponibles.</Text>
          </VStack>
        </Box>
      </Box>

      {/* GRILLA DE PRODUCTOS */}
      <Box w="full" px={8} py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 6 }} gap="6">
          {data.items?.map((prod) => (
            <Box
              key={prod.id}
              bg={colors.bgCard}
              borderRadius="xl"
              overflow="hidden"
              border="1px solid"
              borderColor={colors.border}
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-5px)",
                borderColor: colors.accent,
                shadow: `0 0 20px rgba(0, 209, 255, 0.15)`
              }}
            >
              <Link href={`/productos/${prod.id}`}>
                <Box position="relative" pt="100%" bg="white">
                  <Image
                    src={prod.imagen || "https://via.placeholder.com/400"}
                    alt={prod.nombre}
                    position="absolute" top="0" left="0" w="full" h="full" objectFit="contain"
                    p={2}
                  />
                </Box>
                <Box p={4}>
                  <Text fontWeight="bold" fontSize="xs" color={colors.accent} mb={1}>
                    {prod.marca?.toUpperCase() || 'GENERIC'}
                  </Text>
                  <Text fontWeight="bold" fontSize="md" color={colors.textMain} lineClamp={2} mb={2} h="2.8rem">
                    {prod.nombre}
                  </Text>
                  <Text fontSize="xl" fontWeight="black" color={colors.textMain}>
                    ${prod.precio.toLocaleString('es-AR')}
                  </Text>
                </Box>
              </Link>
              <Box p={4} pt={0}>
                <Button
                  bg={colors.accent}
                  color={colors.bgMain}
                  w="full"
                  fontWeight="bold"
                  size="sm"
                  _hover={{ bg: "white", transform: "scale(1.02)" }}
                >
                  Agregar al carrito
                </Button>
              </Box>
            </Box>
          ))}
        </SimpleGrid>

        {/* PAGINACIÓN DINÁMICA */}
        <Flex justify="center" mt={16} gap="4" pb={12} align="center">
          <IconButton
            aria-label="Anterior"
            variant="ghost"
            color={colors.accent}
            onClick={prevPage}
            disabled={offset === 0}
            _hover={{ bg: colors.bgCard }}
            fontSize="20px"
          >
            <FaChevronLeft />
          </IconButton>

          <Flex
            bg={colors.accent}
            color={colors.bgMain}
            w="50px" h="50px"
            align="center" justify="center"
            borderRadius="full"
            fontWeight="black"
            boxShadow={`0 0 15px ${colors.accent}44`}
          >
            {currentPage}
          </Flex>

          <IconButton
            aria-label="Siguiente"
            variant="ghost"
            color={colors.accent}
            onClick={nextPage}
            disabled={offset + limit >= data.total}
            _hover={{ bg: colors.bgCard }}
            fontSize="20px"
          >
            <FaChevronRight />
          </IconButton>
        </Flex>
      </Box>
    </Box>
  )
}