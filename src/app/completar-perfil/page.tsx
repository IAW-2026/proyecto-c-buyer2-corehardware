'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import {
    Box,
    Button,
    Flex,
    Grid,
    Heading,
    Input,
    Stack,
    Text,
    createListCollection,
} from '@chakra-ui/react'
import {
    SelectContent,
    SelectItem,
    SelectRoot,
    SelectTrigger,
    SelectValueText,
} from '@/components/ui/select'
import { brandColors } from '@/styles/colors'

type FieldErrors = Partial<Record<string, string[]>>

interface FormValues {
    nombre: string
    apellido: string
    dni: string
    cuilCuit: string
    celular: string
    direccion: string
    fechaNacimiento: string
    nacionalidad: string
    sexo: string
    condicionIva: string
}

const sexoOptions = createListCollection({
    items: [
        { label: 'No especificar', value: '' },
        { label: 'Masculino', value: 'M' },
        { label: 'Femenino', value: 'F' },
        { label: 'No binario', value: 'X' },
    ],
})

const ivaOptions = createListCollection({
    items: [
        { label: 'Consumidor Final', value: 'Consumidor Final' },
        { label: 'Responsable Inscripto', value: 'Responsable Inscripto' },
        { label: 'Monotributista', value: 'Monotributista' },
        { label: 'Exento', value: 'Exento' },
    ],
})

function validateForm(v: FormValues): FieldErrors {
    const e: FieldErrors = {}
    if (!v.nombre || v.nombre.length < 2) e.nombre = ['Nombre inválido']
    if (!v.apellido || v.apellido.length < 2) e.apellido = ['Apellido inválido']
    if (!v.dni || v.dni.length < 7 || v.dni.length > 8) e.dni = ['DNI debe tener 7 u 8 dígitos']
    if (!v.cuilCuit || v.cuilCuit.replace(/-/g, '').length < 11) e.cuilCuit = ['CUIL/CUIT inválido']
    if (!v.celular || v.celular.length < 8) e.celular = ['Celular inválido']
    if (!v.direccion || v.direccion.length < 5) e.direccion = ['Dirección inválida']
    if (!v.fechaNacimiento) e.fechaNacimiento = ['Fecha requerida']
    if (!v.nacionalidad) e.nacionalidad = ['Nacionalidad requerida']
    return e
}

function SectionLabel({ children }: { children: string }) {
    return (
        <Text fontSize="11px" fontWeight={600} color={brandColors.accent} letterSpacing="0.1em" textTransform="uppercase" mb={3}>
            {children}
        </Text>
    )
}

function Divider() {
    return <Box borderTop={`1px solid ${brandColors.border}`} my={5} />
}

function StepBar({ total = 4, current = 3 }: { total?: number; current?: number }) {
    return (
        <Flex gap={2} mb={6}>
            {Array.from({ length: total }).map((_, i) => (
                <Box key={i} flex={1} h="3px" borderRadius="2px"
                    bg={i < current ? brandColors.accent : brandColors.border}
                    opacity={i === current - 1 ? 0.55 : 1}
                />
            ))}
        </Flex>
    )
}

function FieldWrapper({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <Stack gap={1}>
            <Text fontSize="12px" fontWeight={500} color={brandColors.textMuted}>{label}</Text>
            {children}
            {error && <Text fontSize="11px" color={brandColors.danger}>{error}</Text>}
        </Stack>
    )
}

const inputBase = {
    bg: brandColors.bgMain,
    border: '1px solid',
    borderColor: brandColors.border,
    borderRadius: '8px',
    color: brandColors.textMain,
    fontSize: '14px',
    height: '38px',
    _placeholder: { color: '#30363D' },
    _focus: { borderColor: brandColors.accent, boxShadow: 'none', outline: 'none' },
    _hover: { borderColor: '#30363D' },
} as const

export default function CompletarPerfilPage() {
    const router = useRouter()
    const { user } = useUser()

    const [values, setValues] = useState<FormValues>({
        nombre: '',
        apellido: '',
        dni: '',
        cuilCuit: '',
        celular: '',
        direccion: '',
        fechaNacimiento: '',
        nacionalidad: '',
        sexo: '',
        condicionIva: 'Consumidor Final',
    })
    const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
    const [serverError, setServerError] = useState('')
    const [loading, setLoading] = useState(false)

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target
        setValues((prev) => ({ ...prev, [name]: value }))
        if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    function handleSelect(name: keyof FormValues, value: string[]) {
        setValues((prev) => ({ ...prev, [name]: value[0] ?? '' }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setServerError('')

        const clientErrors = validateForm(values)
        if (Object.keys(clientErrors).length > 0) {
            setFieldErrors(clientErrors)
            return
        }

        setLoading(true)

        const res = await fetch('/api/perfil', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
        })

        const json = await res.json()

        if (!res.ok) {
            if (json.detalles) setFieldErrors(json.detalles)
            else setServerError(json.error ?? 'Error al guardar el perfil')
            setLoading(false)
            return
        }

        router.push('/productos')
    }

    return (
        <Flex minH="100vh" bg={brandColors.bgMain} align="center" justify="center" px={4} py={12}>
            <Box w="100%" maxW="560px">

                <Box mb={8}>
                    <Text fontSize="12px" color={brandColors.textMuted} letterSpacing="0.08em" textTransform="uppercase" mb={1}>
                        Bienvenido/a, {user?.firstName ?? 'usuario'}
                    </Text>
                    <Heading as="h1" fontSize="22px" fontWeight={600} color={brandColors.textMain} mb={1}>
                        Completá tu perfil
                    </Heading>
                    <Text fontSize="14px" color={brandColors.textMuted} lineHeight={1.6}>
                        Necesitamos algunos datos para procesar tus pedidos correctamente.
                    </Text>
                </Box>

                <StepBar total={4} current={3} />

                {serverError && (
                    <Box mb={5} px={4} py={3} borderRadius="8px" bg="#1C0A0A" border={`1px solid ${brandColors.danger}`}>
                        <Text fontSize="13px" color={brandColors.danger}>{serverError}</Text>
                    </Box>
                )}

                <Box
                    as="form"
                    onSubmit={handleSubmit}
                    bg={brandColors.bgCard}
                    border={`1px solid ${brandColors.border}`}
                    borderRadius="16px"
                    p={{ base: 6, md: 10 }}
                >
                    {/* ── Datos personales ── */}
                    <SectionLabel>Datos personales</SectionLabel>

                    <Grid templateColumns="1fr 1fr" gap={3} mb={3}>
                        <FieldWrapper label="Nombre" error={fieldErrors.nombre?.[0]}>
                            <Input
                                {...inputBase}
                                name="nombre"
                                placeholder="Juan"
                                value={values.nombre}
                                onChange={handleChange}
                                borderColor={fieldErrors.nombre ? brandColors.danger : brandColors.border}
                            />
                        </FieldWrapper>
                        <FieldWrapper label="Apellido" error={fieldErrors.apellido?.[0]}>
                            <Input
                                {...inputBase}
                                name="apellido"
                                placeholder="Pérez"
                                value={values.apellido}
                                onChange={handleChange}
                                borderColor={fieldErrors.apellido ? brandColors.danger : brandColors.border}
                            />
                        </FieldWrapper>
                    </Grid>

                    <Divider />

                    {/* ── Identificación ── */}
                    <SectionLabel>Identificación</SectionLabel>

                    <Grid templateColumns="1fr 1fr" gap={3} mb={3}>
                        <FieldWrapper label="DNI" error={fieldErrors.dni?.[0]}>
                            <Input
                                {...inputBase}
                                name="dni"
                                placeholder="12345678"
                                maxLength={8}
                                value={values.dni}
                                onChange={handleChange}
                                borderColor={fieldErrors.dni ? brandColors.danger : brandColors.border}
                            />
                        </FieldWrapper>
                        <FieldWrapper label="CUIL / CUIT" error={fieldErrors.cuilCuit?.[0]}>
                            <Input
                                {...inputBase}
                                name="cuilCuit"
                                placeholder="20-12345678-9"
                                maxLength={13}
                                value={values.cuilCuit}
                                onChange={handleChange}
                                borderColor={fieldErrors.cuilCuit ? brandColors.danger : brandColors.border}
                            />
                        </FieldWrapper>
                    </Grid>

                    <Grid templateColumns="1fr 1fr" gap={3}>
                        <FieldWrapper label="Fecha de nacimiento" error={fieldErrors.fechaNacimiento?.[0]}>
                            <Input
                                {...inputBase}
                                type="date"
                                name="fechaNacimiento"
                                value={values.fechaNacimiento}
                                onChange={handleChange}
                                borderColor={fieldErrors.fechaNacimiento ? brandColors.danger : brandColors.border}
                                css={{ colorScheme: 'dark' }}
                            />
                        </FieldWrapper>
                        <FieldWrapper label="Sexo (opcional)">
                            <SelectRoot
                                collection={sexoOptions}
                                value={[values.sexo]}
                                onValueChange={(d: { value: string[] }) => handleSelect('sexo', d.value)}
                                size="sm"
                            >
                                <SelectTrigger
                                    bg={brandColors.bgMain}
                                    border="1px solid"
                                    borderColor={brandColors.border}
                                    borderRadius="8px"
                                    color={brandColors.textMain}
                                    fontSize="14px"
                                    h="38px"
                                    _hover={{ borderColor: '#30363D' }}
                                >
                                    <SelectValueText placeholder="No especificar" />
                                </SelectTrigger>
                                <SelectContent bg={brandColors.bgCard} border={`1px solid ${brandColors.border}`} borderRadius="8px" zIndex={10}>
                                    {sexoOptions.items.map((o) => (
                                        <SelectItem key={o.value} item={o} color={brandColors.textMain} _hover={{ bg: brandColors.border }} fontSize="14px" px={3} py={2}>
                                            {o.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </SelectRoot>
                        </FieldWrapper>
                    </Grid>

                    <Divider />

                    {/* ── Contacto y ubicación ── */}
                    <SectionLabel>Contacto y ubicación</SectionLabel>

                    <Stack mb={3}>
                        <FieldWrapper label="Dirección" error={fieldErrors.direccion?.[0]}>
                            <Input
                                {...inputBase}
                                name="direccion"
                                placeholder="Av. Corrientes 1234, CABA"
                                value={values.direccion}
                                onChange={handleChange}
                                borderColor={fieldErrors.direccion ? brandColors.danger : brandColors.border}
                            />
                        </FieldWrapper>
                    </Stack>

                    <Grid templateColumns="1fr 1fr" gap={3}>
                        <FieldWrapper label="Celular" error={fieldErrors.celular?.[0]}>
                            <Input
                                {...inputBase}
                                type="tel"
                                name="celular"
                                placeholder="+54 9 11 1234-5678"
                                value={values.celular}
                                onChange={handleChange}
                                borderColor={fieldErrors.celular ? brandColors.danger : brandColors.border}
                            />
                        </FieldWrapper>
                        <FieldWrapper label="Nacionalidad" error={fieldErrors.nacionalidad?.[0]}>
                            <Input
                                {...inputBase}
                                name="nacionalidad"
                                placeholder="Argentina"
                                value={values.nacionalidad}
                                onChange={handleChange}
                                borderColor={fieldErrors.nacionalidad ? brandColors.danger : brandColors.border}
                            />
                        </FieldWrapper>
                    </Grid>

                    <Divider />

                    {/* ── Datos fiscales ── */}
                    <SectionLabel>Datos fiscales</SectionLabel>

                    <FieldWrapper label="Condición IVA" error={fieldErrors.condicionIva?.[0]}>
                        <SelectRoot
                            collection={ivaOptions}
                            value={[values.condicionIva]}
                            onValueChange={(d: { value: string[] }) => handleSelect('condicionIva', d.value)}
                            size="sm"
                        >
                            <SelectTrigger
                                bg={brandColors.bgMain}
                                border="1px solid"
                                borderColor={brandColors.border}
                                borderRadius="8px"
                                color={brandColors.textMain}
                                fontSize="14px"
                                h="38px"
                                _hover={{ borderColor: '#30363D' }}
                            >
                                <SelectValueText />
                            </SelectTrigger>
                            <SelectContent bg={brandColors.bgCard} border={`1px solid ${brandColors.border}`} borderRadius="8px" zIndex={10}>
                                {ivaOptions.items.map((o) => (
                                    <SelectItem key={o.value} item={o} color={brandColors.textMain} _hover={{ bg: brandColors.border }} fontSize="14px" px={3} py={2}>
                                        {o.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </SelectRoot>
                    </FieldWrapper>

                    <Button
                        type="submit"
                        w="100%"
                        mt={6}
                        h="42px"
                        borderRadius="8px"
                        bg={brandColors.accent}
                        color={brandColors.bgMain}
                        fontWeight={600}
                        fontSize="14px"
                        letterSpacing="0.02em"
                        _hover={{ bg: '#00b8e0' }}
                        _active={{ transform: 'scale(0.98)' }}
                        disabled={loading}
                        loading={loading}
                        loadingText="Guardando..."
                    >
                        Guardar y continuar →
                    </Button>
                </Box>
            </Box>
        </Flex>
    )
}
