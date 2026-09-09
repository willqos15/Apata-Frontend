'use client'

import { useRef, useState, type ChangeEvent, type FocusEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PatternFormat } from 'react-number-format'
import { MdEdit, MdDelete } from 'react-icons/md'
import Button from './Button'
import Spinner from './Spinner'
import { createPet } from '@/lib/api'
import { compressImageIfNeeded, validateImageFile } from '@/lib/imageCompression'
import { petSchema, type PetFormSchema } from '@/lib/validations/pet'

const DEFAULT_PHONE = '93991185009'

type SubmitStatus = 'inicio' | 'load'
type SubmitMessage = '' | 'ok' | 'erro'

const INITIAL_VALUES: PetFormSchema = {
  nome: '',
  especie: 'cachorro',
  porte: 'pequeno',
  sexo: 'macho',
  descricao: '',
  contato: DEFAULT_PHONE,
  vacinado: false,
  vermifugado: false,
  castrado: false,
  microchip: false,
}

function scrollIntoCenter(e: FocusEvent<HTMLElement>) {
  const target = e.target
  setTimeout(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function PetForm() {
  const photoFile = useRef<File | null>(null)
  const photoInput = useRef<HTMLInputElement>(null)

  const [photoError, setPhotoError] = useState<string>('')
  const [photoInfo, setPhotoInfo] = useState<{ name: string; sizeText: string } | null>(null)
  const [isCompressing, setIsCompressing] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  const [message, setMessage] = useState<SubmitMessage>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [status, setStatus] = useState<SubmitStatus>('inicio')

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PetFormSchema>({
    resolver: zodResolver(petSchema),
    mode: 'all',
    defaultValues: INITIAL_VALUES,
  })

  function isPhotoValid(): boolean {
    if (!photoFile.current) {
      setPhotoError('A foto do animal é obrigatória.')
      return false
    }
    const validation = validateImageFile(photoFile.current)
    if (!validation.valid) {
      setPhotoError(validation.error || 'Formato de imagem inválido.')
      return false
    }
    setPhotoError('')
    return true
  }

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoError('')
    setErrorMessage('')

    // 1. Validação de formato (JPEG, JPG ou PNG)
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setPhotoError(validation.error || 'Formato inválido. Apenas imagens JPEG, PNG ou JPG são permitidas.')
      photoFile.current = null
      setPhotoInfo(null)
      setPhotoPreview(null)
      if (photoInput.current) photoInput.current.value = ''
      return
    }

    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2)

    // 2. Compressão caso exceda 5MB
    try {
      if (file.size > 5 * 1024 * 1024) {
        setIsCompressing(true)
        const compressed = await compressImageIfNeeded(file)
        photoFile.current = compressed
        setPhotoInfo({
          name: compressed.name,
          sizeText: `(Original: ${originalSizeMB} MB ➔ Comprimida: ${formatFileSize(compressed.size)})`,
        })
      } else {
        photoFile.current = file
        setPhotoInfo({
          name: file.name,
          sizeText: `(${formatFileSize(file.size)})`,
        })
      }

      // Gerar preview local
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPhotoPreview(reader.result)
        }
      }
      reader.readAsDataURL(photoFile.current)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar imagem.'
      setPhotoError(msg)
      photoFile.current = null
      setPhotoInfo(null)
      setPhotoPreview(null)
      if (photoInput.current) photoInput.current.value = ''
    } finally {
      setIsCompressing(false)
    }
  }

  function handleRemovePhoto() {
    photoFile.current = null
    setPhotoPreview(null)
    setPhotoInfo(null)
    setPhotoError('')
    if (photoInput.current) {
      photoInput.current.value = ''
    }
  }

  async function submit(values: PetFormSchema) {
    if (status !== 'inicio' || isCompressing) return
    if (!isPhotoValid()) return

    setStatus('load')
    setMessage('')
    setErrorMessage('')

    const formData = new FormData()
    formData.append('nome', values.nome)
    formData.append('especie', values.especie)
    formData.append('porte', values.porte)
    formData.append('sexo', values.sexo)
    formData.append('descricao', values.descricao)
    if (photoFile.current) formData.append('file', photoFile.current)
    formData.append('contato', values.contato)
    formData.append('vacinado', String(values.vacinado ?? false))
    formData.append('vermifugado', String(values.vermifugado ?? false))
    formData.append('castrado', String(values.castrado ?? false))
    formData.append('microchip', String(values.microchip ?? false))

    try {
      await createPet(formData)
      reset(INITIAL_VALUES)
      if (photoInput.current) photoInput.current.value = ''
      photoFile.current = null
      setPhotoInfo(null)
      setPhotoPreview(null)
      setPhotoError('')
      setStatus('inicio')
      setMessage('ok')
    } catch (error: unknown) {
      console.error(error)
      setStatus('inicio')
      setMessage('erro')
      if (
        error &&
        typeof error === 'object' &&
        'response' in error &&
        error.response &&
        typeof error.response === 'object' &&
        'data' in error.response &&
        error.response.data &&
        typeof error.response.data === 'object' &&
        'error' in error.response.data &&
        typeof error.response.data.error === 'string'
      ) {
        setErrorMessage(error.response.data.error)
      } else {
        setErrorMessage('Erro ao cadastrar animal.')
      }
    }
  }

  return (
    <div className="pt-10 relative min-h-screen">
      <form
        onSubmit={(e) => void handleSubmit(submit)(e)}
        className="flex flex-col max-w-72 px-5 my-10 mx-auto justify-start rounded-2xl bg-(--bg-color2)"
      >
        <fieldset disabled={status !== 'inicio' || isCompressing} className="flex flex-col">
          <label className="formlabel">Nome do animal:</label>
          <input
            className="input"
            {...register('nome')}
            type="text"
            placeholder="Nome do animal."
            onFocus={scrollIntoCenter}
          />
          {errors.nome && <p className="formerro">{errors.nome.message}</p>}

          <label className="formlabel">Carregue uma imagem:</label>

          <input
            type="file"
            ref={photoInput}
            onChange={handleFileChange}
            onFocus={scrollIntoCenter}
            className="hidden"
            accept="image/jpeg,image/png,image/jpg"
          />

          <div className="flex flex-col items-center gap-2 my-1">
            <div className="flex items-center justify-center gap-2 w-full my-1">
              <button
                type="button"
                onClick={() => photoInput.current?.click()}
                disabled={isCompressing}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200 transition-all cursor-pointer border border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              >
                <MdEdit className="text-base" />
                {photoPreview ? 'Editar foto' : 'Escolher foto'}
              </button>

              <button
                type="button"
                onClick={handleRemovePhoto}
                disabled={!photoPreview || isCompressing}
                className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full transition-all border shadow-xs ${
                  photoPreview && !isCompressing
                    ? 'bg-red-100 text-red-800 hover:bg-red-200 border-red-300 cursor-pointer'
                    : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-60'
                }`}
              >
                <MdDelete className="text-base" />
                Remover foto
              </button>
            </div>

            {isCompressing && (
              <div className="flex items-center justify-center gap-2 mt-1">
                <Spinner className="w-5 h-5" />
                <p className="text-sm text-(--text-color) font-bold animate-pulse">Comprimindo imagem para &le; 5MB...</p>
              </div>
            )}

            {photoPreview && (
              <div className="mt-2 flex flex-col items-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoPreview}
                  alt="Preview do animal"
                  className="w-24 h-24 object-cover rounded-full border-4 border-(--primary-color) shadow-sm"
                />
              </div>
            )}

            {photoInfo && (
              <div className="pl-1 pt-1 text-center">
                <p className="text-[14px] font-bold text-(--text-color) break-words">{photoInfo.name}</p>
                <p className="text-[12px] text-(--text-color2)">{photoInfo.sizeText}</p>
              </div>
            )}

            {photoError && <p className="formerro">{photoError}</p>}
          </div>

          <label className="formlabel">Espécie</label>
          <select className="input" {...register('especie')}>
            <option value="cachorro">Cachorro</option>
            <option value="gato">Gato</option>
          </select>
          {errors.especie && <p className="formerro">{errors.especie.message}</p>}

          <label className="formlabel">Porte</label>
          <select className="input" {...register('porte')}>
            <option value="pequeno">Pequeno</option>
            <option value="medio">Médio</option>
            <option value="grande">Grande</option>
          </select>
          {errors.porte && <p className="formerro">{errors.porte.message}</p>}

          <label className="formlabel">Sexo</label>
          <select className="input" {...register('sexo')}>
            <option value="macho">Macho</option>
            <option value="femea">Fêmea</option>
          </select>
          {errors.sexo && <p className="formerro">{errors.sexo.message}</p>}

          <label className="formlabel">Sobre:</label>
          <textarea
            className="textarea max-h-16"
            {...register('descricao')}
            rows={2}
            placeholder="Idade, castrado, deficiência e etc."
            onFocus={scrollIntoCenter}
          />
          {errors.descricao && <p className="formerro">{errors.descricao.message}</p>}

          <label className="formlabel">Contato:</label>
          <Controller
            name="contato"
            control={control}
            render={({ field: { ref, onChange, ...field } }) => (
              <PatternFormat
                {...field}
                getInputRef={ref}
                className="input"
                prefix="+55 "
                format="(##) # ####-####"
                placeholder="(XX) X XXXX-XXXX"
                onFocus={scrollIntoCenter}
                inputMode="numeric"
                onValueChange={(values) => onChange(values.value)}
              />
            )}
          />
          {errors.contato && <p className="formerro">{errors.contato.message}</p>}

          <label className="formlabel">Saúde e Cuidados (opcional):</label>
          <div className="grid grid-cols-2 gap-2 my-2 text-left px-2">
            <label className="flex items-center gap-2 text-sm text-(--text-color2) cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('vacinado')}
                className="w-4 h-4 accent-(--text-color) cursor-pointer"
              />
              <span>Vacinado</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-(--text-color2) cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('vermifugado')}
                className="w-4 h-4 accent-(--text-color) cursor-pointer"
              />
              <span>Vermifugado</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-(--text-color2) cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('castrado')}
                className="w-4 h-4 accent-(--text-color) cursor-pointer"
              />
              <span>Castrado</span>
            </label>
            <label className="flex items-center gap-2 text-sm text-(--text-color2) cursor-pointer select-none">
              <input
                type="checkbox"
                {...register('microchip')}
                className="w-4 h-4 accent-(--text-color) cursor-pointer"
              />
              <span>Microchip</span>
            </label>
          </div>
        </fieldset>

        <br />
        <Button
          name={status === 'inicio' ? 'Salvar' : 'Salvando...'}
          type="submit"
          size={20}
          disabled={status !== 'inicio' || isCompressing}
          className={
            status === 'inicio' && !isCompressing
              ? ''
              : 'cursor-default bg-gray-300 text-gray-600 hover:bg-gray-300 hover:text-gray-600'
          }
        />
      </form>

      {status === 'load' && <Spinner className="mx-auto m-4" />}

      {message === 'ok' && status !== 'load' && (
        <p className="p-2 text-base text-green-600 font-bold">Cadastro feito com sucesso!</p>
      )}
      {message === 'erro' && status !== 'load' && (
        <p className="pt-10 text-base text-[rgb(128,0,0)] font-bold">{errorMessage || 'Erro ao cadastrar!'}</p>
      )}
    </div>
  )
}
