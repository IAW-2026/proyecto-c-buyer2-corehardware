'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth, useClerk } from '@clerk/nextjs'
import {
  Box, Container, Flex, Grid, Text, VStack,
  Spinner, Icon, Input, Select, createListCollection
} from '@chakra-ui/react'
import {
  FaUser, FaExclamationCircle, FaExclamationTriangle,
  FaSave, FaTrash,
} from 'react-icons/fa'
import { BackButton } from '@/components/ui/BackButton'
import { toaster } from '@/components/ui/toaster'
import { Comprador } from '@/app/hooks/useComprador'

// ── Tipos ──────────────────────────────────────────────────────────────────

type FormData = Omit<Comprador, 'id' | 'mail'>
//TODO
// const CONDICIONES_IVA = [
//   'Consumidor Final',
//   'Responsable Inscripto',
//   'Monotributista',
//   'Exento',
// ]


export const CONDICIONES_IVA = createListCollection({
  items: [
    { label: "Responsable Inscripto", value: "Responsable Inscripto" },
    { label: "Exento", value: "Exento" },
    { label: "Monotributista", value: "Monotributista" },
    { label: "Consumidor Final", value: "Consumidor Final" },
  ],
})
//TODO
//const SEXOS = ['M', 'F', 'X'] as const
export const SEXOS = createListCollection({
  items: [
    { label: "Masculino", value: "M" },
    { label: "Femenino", value: "F" },
    { label: "No binario / Otro", value: "X" },
  ],
})

// ── Helpers ────────────────────────────────────────────────────────────────

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <VStack align="start" gap={1}>
      <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
        {label}
      </Text>
      {children}
    </VStack>
  )
}

// ── Página principal ───────────────────────────────────────────────────────

export default function PerfilPage() {
  const { isSignedIn, isLoaded } = useAuth()
  const { signOut } = useClerk()
  const router = useRouter()

  const [form, setForm] = useState<FormData>({
    nombre: '', apellido: '', dni: '', cuilCuit: '',
    celular: '', direccion: '', fechaNacimiento: '',
    nacionalidad: '', sexo: '', condicionIva: 'Consumidor Final',
  })
  const [mail, setMail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  // Cargar datos al montar
  useEffect(() => {
    if (!isLoaded) return
    if (!isSignedIn) {
      router.push('/sign-in?redirectUrl=/perfil')
      return
    }

    fetch('/api/perfil')
      .then(async (r) => {
        if (r.status === 404) return null
        if (!r.ok) throw new Error('Error al cargar perfil')
        return r.json()
      })
      .then((data: Comprador | null) => {
        if (data) {
          setMail(data.mail)
          setForm({
            nombre: data.nombre,
            apellido: data.apellido,
            dni: data.dni,
            cuilCuit: data.cuilCuit,
            celular: data.celular,
            direccion: data.direccion,
            fechaNacimiento: data.fechaNacimiento,
            nacionalidad: data.nacionalidad,
            sexo: data.sexo ?? '',
            condicionIva: data.condicionIva as string,
          })
        }
      })
      .catch(() => setError('No pudimos cargar tu perfil.'))
      .finally(() => setLoading(false))
  }, [isLoaded, isSignedIn, router])

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    setFieldErrors((prev) => ({ ...prev, [field]: [] }))
  }

  // Guardar cambios
  const handleSave = async () => {
    setSaving(true)
    setFieldErrors({})
    try {
      const res = await fetch('/api/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (res.status === 400) {
        const data = await res.json()
        setFieldErrors(data.detalles ?? {})
        return
      }
      if (res.status === 409) {
        setFieldErrors({ dni: ['El DNI ya está registrado'] })
        return
      }
      if (!res.ok) throw new Error('Error al guardar')

      toaster.create({
        title: 'Perfil actualizado',
        description: 'Tus datos fueron guardados correctamente.',
        type: 'success',
      })
    } catch {
      toaster.create({
        title: 'Error',
        description: 'No pudimos guardar los cambios. Intentá de nuevo.',
        type: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  // Eliminar perfil
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }

    setDeleting(true)
    try {
      const res = await fetch('/api/perfil', { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar')

      toaster.create({
        title: 'Perfil eliminado',
        description: 'Tu cuenta fue eliminada correctamente.',
        type: 'info',
      })

      await signOut()
      router.push('/productos')
    } catch {
      toaster.create({
        title: 'Error',
        description: 'No pudimos eliminar tu perfil. Intentá de nuevo.',
        type: 'error',
      })
      setDeleting(false)
      setConfirmDelete(false)
    }
  }

  // ── Estados de carga ──

  if (!isLoaded || loading) {
    return (
      <Flex justify="center" align="center" minH="60vh">
        <Spinner color="brand.accent" size="lg" />
      </Flex>
    )
  }

  if (error) {
    return (
      <Container maxW="container.sm" py={8}>
        <Flex direction="column" align="center" gap={4}>
          <Icon as={FaExclamationCircle} boxSize={10} color="brand.danger" />
          <Text color="brand.textMuted">{error}</Text>
        </Flex>
      </Container>
    )
  }

  return (
    <Container maxW="container.md" py={8} px={{ base: 4, md: 6 }}>

      {/* Encabezado */}
      <Flex align="center" gap={3} mb={8}>
        <BackButton />
        <VStack align="start" gap={0}>
          <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider">
            Cuenta
          </Text>
          <Text fontSize="2xl" fontWeight="black" color="brand.textMain">
            Mi Perfil
          </Text>
        </VStack>
        <Flex
          ml="auto"
          w="44px" h="44px"
          borderRadius="full"
          bg="rgba(0,209,255,0.08)"
          border="1px solid"
          borderColor="brand.border"
          align="center"
          justify="center"
        >
          <Icon as={FaUser} color="brand.accent" boxSize={4} />
        </Flex>
      </Flex>

      {/* Email — solo lectura */}
      <Box
        bg="brand.bgCard"
        border="1px solid"
        borderColor="brand.border"
        borderRadius="xl"
        p={5}
        mb={4}
      >
        <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={3}>
          Datos de acceso
        </Text>
        <FieldGroup label="Email">
          <Text fontSize="sm" color="brand.textMuted" fontStyle="italic">
            {mail || '—'} · gestionado por Clerk
          </Text>
        </FieldGroup>
      </Box>

      {/* Datos personales */}
      <Box
        bg="brand.bgCard"
        border="1px solid"
        borderColor="brand.border"
        borderRadius="xl"
        p={5}
        mb={4}
      >
        <Text fontSize="xs" color="brand.textMuted" textTransform="uppercase" letterSpacing="wider" mb={4}>
          Datos personales
        </Text>

        <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={4}>
          <FieldGroup label="Nombre">
            <Input
              value={form.nombre}
              onChange={(e) => handleChange('nombre', e.target.value)}
              bg="brand.bgMain"
              border="1px solid"
              borderColor={fieldErrors.nombre ? 'brand.danger' : 'brand.border'}
              color="brand.textMain"
              _focus={{ borderColor: 'brand.accent', outline: 'none' }}
              size="sm"
              borderRadius="lg"
            />
            {fieldErrors.nombre && (
              <Text fontSize="xs" color="brand.danger">{fieldErrors.nombre[0]}</Text>
            )}
          </FieldGroup>

          <FieldGroup label="Apellido">
            <Input
              value={form.apellido}
              onChange={(e) => handleChange('apellido', e.target.value)}
              bg="brand.bgMain"
              border="1px solid"
              borderColor={fieldErrors.apellido ? 'brand.danger' : 'brand.border'}
              color="brand.textMain"
              _focus={{ borderColor: 'brand.accent', outline: 'none' }}
              size="sm"
              borderRadius="lg"
            />
            {fieldErrors.apellido && (
              <Text fontSize="xs" color="brand.danger">{fieldErrors.apellido[0]}</Text>
            )}
          </FieldGroup>

          <FieldGroup label="DNI">
            <Input
              value={form.dni}
              onChange={(e) => handleChange('dni', e.target.value)}
              bg="brand.bgMain"
              border="1px solid"
              borderColor={fieldErrors.dni ? 'brand.danger' : 'brand.border'}
              color="brand.textMain"
              _focus={{ borderColor: 'brand.accent', outline: 'none' }}
              size="sm"
              borderRadius="lg"
            />
            {fieldErrors.dni && (
              <Text fontSize="xs" color="brand.danger">{fieldErrors.dni[0]}</Text>
            )}
          </FieldGroup>

          <FieldGroup label="CUIL/CUIT">
            <Input
              value={form.cuilCuit}
              onChange={(e) => handleChange('cuilCuit', e.target.value)}
              bg="brand.bgMain"
              border="1px solid"
              borderColor={fieldErrors.cuilCuit ? 'brand.danger' : 'brand.border'}
              color="brand.textMain"
              _focus={{ borderColor: 'brand.accent', outline: 'none' }}
              size="sm"
              borderRadius="lg"
            />
            {fieldErrors.cuilCuit && (
              <Text fontSize="xs" color="brand.danger">{fieldErrors.cuilCuit[0]}</Text>
            )}
          </FieldGroup>

          <FieldGroup label="Celular">
            <Input
              value={form.celular}
              onChange={(e) => handleChange('celular', e.target.value)}
              bg="brand.bgMain"
              border="1px solid"
              borderColor={fieldErrors.celular ? 'brand.danger' : 'brand.border'}
              color="brand.textMain"
              _focus={{ borderColor: 'brand.accent', outline: 'none' }}
              size="sm"
              borderRadius="lg"
            />
            {fieldErrors.celular && (
              <Text fontSize="xs" color="brand.danger">{fieldErrors.celular[0]}</Text>
            )}
          </FieldGroup>

          <FieldGroup label="Fecha de nacimiento">
            <Input
              type="date"
              value={form.fechaNacimiento}
              onChange={(e) => handleChange('fechaNacimiento', e.target.value)}
              bg="brand.bgMain"
              border="1px solid"
              borderColor={fieldErrors.fechaNacimiento ? 'brand.danger' : 'brand.border'}
              color="brand.textMain"
              _focus={{ borderColor: 'brand.accent', outline: 'none' }}
              size="sm"
              borderRadius="lg"
            />
            {fieldErrors.fechaNacimiento && (
              <Text fontSize="xs" color="brand.danger">{fieldErrors.fechaNacimiento[0]}</Text>
            )}
          </FieldGroup>

          <FieldGroup label="Dirección">
            <Input
              value={form.direccion}
              onChange={(e) => handleChange('direccion', e.target.value)}
              bg="brand.bgMain"
              border="1px solid"
              borderColor={fieldErrors.direccion ? 'brand.danger' : 'brand.border'}
              color="brand.textMain"
              _focus={{ borderColor: 'brand.accent', outline: 'none' }}
              size="sm"
              borderRadius="lg"
            />
            {fieldErrors.direccion && (
              <Text fontSize="xs" color="brand.danger">{fieldErrors.direccion[0]}</Text>
            )}
          </FieldGroup>

          <FieldGroup label="Nacionalidad">
            <Input
              value={form.nacionalidad}
              onChange={(e) => handleChange('nacionalidad', e.target.value)}
              bg="brand.bgMain"
              border="1px solid"
              borderColor={fieldErrors.nacionalidad ? 'brand.danger' : 'brand.border'}
              color="brand.textMain"
              _focus={{ borderColor: 'brand.accent', outline: 'none' }}
              size="sm"
              borderRadius="lg"
            />
            {fieldErrors.nacionalidad && (
              <Text fontSize="xs" color="brand.danger">{fieldErrors.nacionalidad[0]}</Text>
            )}
          </FieldGroup>

          <FieldGroup label="Sexo">
            <Select.Root
              collection={SEXOS as unknown as any}
              value={form.sexo ? [form.sexo] : []}
              onValueChange={(e) => handleChange('sexo', e.value[0])}
              size="sm"
            >
              <Select.Trigger
                bg="brand.bgMain"
                border="1px solid"
                borderColor="brand.border"
                color="brand.textMain"
                borderRadius="lg"
              >
                <Select.ValueText placeholder="Seleccioná" />
              </Select.Trigger>
              <Select.Content bg="brand.bgCard" border="1px solid" borderColor="brand.border">
                {SEXOS.items.map((item) => (
                  <Select.Item key={item.value} item={item} color="brand.textMain">
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </FieldGroup>

          <FieldGroup label="Condición IVA">
            <Select.Root
              collection={CONDICIONES_IVA}
              value={[form.condicionIva]}
              onValueChange={(e) => handleChange('condicionIva', e.value[0])}
              size="sm"
            >
              <Select.Trigger
                bg="brand.bgMain"
                border="1px solid"
                borderColor="brand.border"
                color="brand.textMain"
                borderRadius="lg"
              >
                <Select.ValueText />
              </Select.Trigger>
              <Select.Content bg="brand.bgCard" border="1px solid" borderColor="brand.border">
                {CONDICIONES_IVA.items.map((item) => (
                  <Select.Item key={item.value} item={item} color="brand.textMain">
                    {item.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </FieldGroup>
        </Grid>

        {/* Botón guardar */}
        <Flex justify="flex-end" mt={6}>
          <Box
            as="button"
            px={6} py={2.5}
            bg="brand.accent"
            color="brand.bgMain"
            borderRadius="lg"
            fontWeight="bold"
            fontSize="sm"
            transition="all 0.2s"
            _hover={{ opacity: 0.85 }}
            _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
            onClick={handleSave}
            aria-disabled={saving}
          >
            <Flex align="center" gap={2}>
              {saving ? <Spinner size="xs" /> : <Icon as={FaSave} boxSize={3} />}
              <Text>{saving ? 'Guardando...' : 'Guardar cambios'}</Text>
            </Flex>
          </Box>
        </Flex>
      </Box>

      {/* Zona de peligro — eliminar cuenta */}
      <Box
        bg="brand.bgCard"
        border="1px solid"
        borderColor={confirmDelete ? 'brand.danger' : 'brand.border'}
        borderRadius="xl"
        p={5}
        transition="border-color 0.2s"
      >
        <Text fontSize="xs" color="brand.danger" textTransform="uppercase" letterSpacing="wider" mb={3}>
          Zona de peligro
        </Text>

        {!confirmDelete ? (
          <Flex justify="space-between" align="center">
            <VStack align="start" gap={0}>
              <Text fontSize="sm" fontWeight="medium" color="brand.textMain">
                Eliminar mi cuenta
              </Text>
              <Text fontSize="xs" color="brand.textMuted">
                Esta acción no se puede deshacer. Tu historial de pedidos se conservará.
              </Text>
            </VStack>
            <Box
              as="button"
              px={4} py={2}
              border="1px solid"
              borderColor="brand.danger"
              borderRadius="lg"
              color="brand.danger"
              fontSize="sm"
              fontWeight="medium"
              transition="all 0.2s"
              _hover={{ bg: 'rgba(248,81,73,0.08)' }}
              onClick={() => setConfirmDelete(true)}
            >
              <Flex align="center" gap={2}>
                <Icon as={FaTrash} boxSize={3} />
                <Text>Eliminar cuenta</Text>
              </Flex>
            </Box>
          </Flex>
        ) : (
          <VStack align="start" gap={4}>
            <Flex align="start" gap={3}>
              <Icon as={FaExclamationTriangle} color="brand.danger" boxSize={4} mt={0.5} flexShrink={0} />
              <VStack align="start" gap={1}>
                <Text fontSize="sm" fontWeight="bold" color="brand.danger">
                  ¿Estás seguro?
                </Text>
                <Text fontSize="xs" color="brand.textMuted">
                  Tu cuenta será desactivada y se cerrará la sesión automáticamente.
                  Tu historial de pedidos se conservará por trazabilidad.
                </Text>
              </VStack>
            </Flex>
            <Flex gap={3}>
              <Box
                as="button"
                px={4} py={2}
                bg="brand.danger"
                color="white"
                borderRadius="lg"
                fontSize="sm"
                fontWeight="bold"
                transition="all 0.2s"
                _hover={{ opacity: 0.85 }}
                onClick={handleDelete}
              >
                <Flex align="center" gap={2}>
                  {deleting ? <Spinner size="xs" /> : <Icon as={FaTrash} boxSize={3} />}
                  <Text>{deleting ? 'Eliminando...' : 'Sí, eliminar mi cuenta'}</Text>
                </Flex>
              </Box>
              <Box
                as="button"
                px={4} py={2}
                border="1px solid"
                borderColor="brand.border"
                borderRadius="lg"
                color="brand.textMuted"
                fontSize="sm"
                transition="all 0.2s"
                _hover={{ borderColor: 'brand.accent', color: 'brand.accent' }}
                onClick={() => setConfirmDelete(false)}
              >
                Cancelar
              </Box>
            </Flex>
          </VStack>
        )}
      </Box>

    </Container>
  )
}