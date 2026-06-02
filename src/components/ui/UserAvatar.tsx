import { Flex } from '@chakra-ui/react'
import { UserButton } from '@clerk/nextjs'
import { FaBox, FaUser } from 'react-icons/fa'

interface UserAvatarProps {
  /** Mostrar links de navegación de usuario final (pedidos, perfil).
   *  En AdminNavbar no se necesitan. */
  showUserLinks?: boolean
}

export function UserAvatar({ showUserLinks = false }: UserAvatarProps) {
  return (
    <Flex
      align="center"
      justify="center"
      borderWidth="2px"
      borderStyle="solid"
      borderColor="brand.accent"
      borderRadius="full"
      h="36px"
      w="36px"
      overflow="hidden"
      aria-label="Menú de usuario"
    >
      <UserButton
        appearance={{
          elements: {
            userButtonTrigger: {
              width: '100%',
              height: '100%',
              padding: 0,
              margin: 0,
              outline: 'none',
              boxShadow: 'none',
            },
            userButtonAvatarFallback: {
              backgroundColor: '#00d1ff',
              color: '#0d1117',
              fontWeight: 'bold',
            },
            userButtonAvatarBox: {
              width: '100%',
              height: '100%',
              borderRadius: 'full',
            },
          },
        }}
      >
        {showUserLinks && (
          <UserButton.MenuItems>
            <UserButton.Link
              label="Mis pedidos"
              labelIcon={<FaBox />}
              href="/pedidos"
            />
            <UserButton.Link
              label="Mi perfil"
              labelIcon={<FaUser />}
              href="/perfil"
            />
          </UserButton.MenuItems>
        )}
      </UserButton>
    </Flex>
  )
}