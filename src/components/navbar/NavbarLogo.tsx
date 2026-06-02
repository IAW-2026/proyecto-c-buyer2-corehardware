import Link from "next/link";
import { Heading, Text } from "@chakra-ui/react";


export default function NavbarLogo() {
  return (
    <Link href="/" passHref style={{ textDecoration: 'none' }} aria-label="CoreHardware - Ir al inicio">
      <Heading
        size="lg"
        color="brand.accent"
        fontWeight="black"
            letterSpacing="widest"
            flexShrink={0}
            _hover={{ opacity: 0.8 }}
          >
            CORE<Text as="span" color="brand.textMain">HARDWARE</Text>
          </Heading>
        </Link>
    )
}

