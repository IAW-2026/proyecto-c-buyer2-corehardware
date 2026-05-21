'use client'

import { useState, useEffect } from 'react'
import {
  Box, Flex, Image, SimpleGrid, Text,
  Button, Heading, Badge, VStack, Spinner, Center
} from '@chakra-ui/react'
import { FaSearch } from 'react-icons/fa'
import Link from 'next/link'
import { getProducts } from '@/services/productService'
import AppNavbar from '@/components/AppNavbar'
import Pagination from '@/components/Pagination'


function HydrationLoader() {
  return <div style={{ backgroundColor: "#0D1117", minHeight: "100vh" }} />
}

export default function ListadoProductos() {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<{ items: any[], total: number }>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const limit = 20;

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const res = await getProducts({ offset, limit });
        if (res && res.items) {
          setData(res);
        } else {
          setData({ items: [], total: 0 });
        }
      } catch (error) {
        console.error("Error cargando productos:", error);
        setData({ items: [], total: 0 });
      } finally {
        setLoading(false);
        setMounted(true); // Avisa que ya estamos en el cliente
      }
    };
    cargarDatos();
  }, [offset, limit]);

  const handlePageChange = (newOffset: number) => {
    setOffset(newOffset);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    if (!mounted) return <HydrationLoader />

    return (
      <Box bg="brand.bgMain" minH="100vh">
        <AppNavbar />
        <Center mt={20}>
          <VStack gap={4}>
            <Spinner color="brand.accent" size="xl" borderWidth="4px" />
            <Text color="brand.accent" fontWeight="bold" letterSpacing="widest">CARGANDO HARDWARE...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  if (data.items?.length === 0) {
    if (!mounted) return <HydrationLoader />

    return (
      <Box bg="brand.bgMain" minH="100vh">
        <AppNavbar />
        <Center mt={20} p={10}>
          <VStack gap={6}>
            <Box fontSize="6xl" color="brand.accent"><FaSearch /></Box>
            <Heading size="lg" textAlign="center" color="brand.textMain">No hay productos disponibles</Heading>
            <Button
              variant="outline"
              borderColor="brand.accent"
              color="brand.accent"
              onClick={() => window.location.reload()}
              borderRadius="full"
              px={10}
              py={6}
              fontSize="md"
              fontWeight="bold"
              _hover={{
                bg: "rgba(0, 209, 255, 0.1)",
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

  if (!mounted) return <HydrationLoader />

  return (
    <Box bg="brand.bgMain" minH="100vh" color="brand.textMain">
      <AppNavbar />

      {/* BANNER */}
      <Box w="full" px={8} mt={6}>
        <Box
          w="full" h="150px"
          bgGradient="to-r" gradientFrom="brand.bgCard" gradientTo="brand.border"
          borderRadius="2xl" display="flex" alignItems="center" px={12}
          border="1px solid" borderColor="brand.border"
        >
          <VStack align="start" gap="0">
            <Badge variant="outline" colorPalette="cyan" mb={2}>CATÁLOGO OFICIAL</Badge>
            <Heading size="xl">CORE HARDWARE</Heading>
            <Text color="brand.textMuted">Explorando {data.total} componentes disponibles.</Text>
          </VStack>
        </Box>
      </Box>

      {/* GRILLA DE PRODUCTOS */}
      <Box w="full" px={8} py={10}>
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4, xl: 6 }} gap="6">
          {data.items?.map((prod) => (
            <Box
              key={prod.id}
              bg="brand.bgCard"
              borderRadius="xl"
              overflow="hidden"
              border="1px solid"
              borderColor="brand.border"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-5px)",
                borderColor: "brand.accent",
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
                  <Text fontWeight="bold" fontSize="xs" color="brand.accent" mb={1}>
                    {prod.marca?.toUpperCase() || 'GENERIC'}
                  </Text>
                  <Text fontWeight="bold" fontSize="md" color="brand.textMain" lineClamp={2} mb={2} h="2.8rem">
                    {prod.nombre}
                  </Text>
                  <Text fontSize="xl" fontWeight="black" color="brand.textMain">
                    ${prod.precio.toLocaleString('es-AR')}
                  </Text>
                </Box>
              </Link>
              <Box p={4} pt={0}>
                <Button
                  bg="brand.accent"
                  color="brand.bgMain"
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

        <Pagination
          totalItems={data.total}
          limit={limit}
          offset={offset}
          onPageChange={handlePageChange}
        />

      </Box>
    </Box>
  )
}