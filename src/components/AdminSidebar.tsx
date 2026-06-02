'use client'

import { Box, Flex, Text } from '@chakra-ui/react'
import { FaClipboardList, FaChevronLeft, FaChevronRight, FaUsers, FaChartBar } from 'react-icons/fa'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
    collapsed: boolean
    onToggle: () => void
}

const items = [
    { href: '/dashboard', icon: FaClipboardList, label: 'Pedidos' },
    { href: '/dashboard/compradores', icon: FaUsers, label: 'Compradores' },
    { href: '/dashboard/reportes', icon: FaChartBar, label: 'Reportes' },
]

export default function AdminSidebar({ collapsed, onToggle }: Props) {
    const pathname = usePathname()

    return (
        <Box
            as="nav"
            aria-label="Navegación admin"
            bg="brand.bgCard"
            borderRight="1px solid"
            borderColor="brand.border"
            w={collapsed ? '56px' : '200px'}
            minH="100%"
            transition="width 0.2s ease"
            position="relative"
            flexShrink={0}
        >
            {/* TOGGLE */}
            <Flex
                as="button"
                aria-label={collapsed ? 'Expandir menú' : 'Colapsar menú'}
                onClick={onToggle}
                align="center"
                justify="center"
                w="24px"
                h="24px"
                borderRadius="full"
                bg="brand.bgCard"
                border="1px solid"
                borderColor="brand.border"
                color="brand.textMuted"
                cursor="pointer"
                position="absolute"
                top="20px"
                right="-12px"
                zIndex={5}
                _hover={{ color: 'brand.accent', borderColor: 'brand.accent' }}
                transition="all 0.15s"
            >
                {collapsed
                    ? <FaChevronRight size={10} aria-hidden="true" />
                    : <FaChevronLeft size={10} aria-hidden="true" />
                }
            </Flex>

            {/* ITEMS */}
            <Flex direction="column" pt={4} gap={1}>
                {items.map(({ href, icon: Icon, label }) => {
                    const active = pathname === href

                    const linkContent = (
                        <Link href={href} style={{ textDecoration: 'none' }} key={href}>
                            <Flex
                                align="center"
                                gap={3}
                                px={collapsed ? 0 : 4}
                                justify={collapsed ? 'center' : 'flex-start'}
                                h="44px"
                                color={active ? 'brand.accent' : 'brand.textMuted'}
                                bg={active ? 'brand.border' : 'transparent'}
                                borderLeft="2px solid"
                                borderColor={active ? 'brand.accent' : 'transparent'}
                                _hover={{ color: 'brand.accent', bg: 'brand.border' }}
                                transition="all 0.15s"
                                cursor="pointer"
                            >
                                <Icon size={15} aria-hidden="true" />
                                {!collapsed && <Text fontSize="sm">{label}</Text>}
                            </Flex>
                        </Link>
                    )

                    return collapsed ? (
                        <Box key={href} title={label}>
                            {linkContent}
                        </Box>
                    ) : linkContent
                })}
            </Flex>
        </Box>
    )
}