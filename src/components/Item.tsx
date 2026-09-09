'use client'

import { useRef, useState, type ChangeEvent, type FocusEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PatternFormat } from 'react-number-format'
import { MdAddPhotoAlternate } from 'react-icons/md'
import { IoLogoWhatsapp, IoMdFemale, IoMdMale } from 'react-icons/io'
import Button from './Button'
import Popup from './Popup'
import Spinner from './Spinner'
import { compressImageIfNeeded, validateImageFile } from '@/lib/imageCompression'
import { petSchema, type PetFormSchema } from '@/lib/validations/pet'
import type { Pet } from '@/types'

interface ItemProps {
  pet: Pet
  admin: boolean
  onDelete?: (id: Pet['id'], name: string) => void
  onUpdate?: (id: Pet['id'], formData: FormData) => Promise<unknown>
  onStart?: () => void
  onEnd?: () => void
}

function digitsOnly(value: string): string {
  return value.replace(/\D/g, '')
}

function scrollIntoCenter(e: FocusEvent<HTMLElement>) {
  const target = e.target
  setTimeout(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}

function capitalize(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function Item({ pet, admin, onDelete, onUpdate, onStart, onEnd }: ItemProps) {
  const { id, nome, descricao, especie, foto, porte, sexo, contato } = pet

  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string>('')
  const [isCompressing, setIsCompressing] = useState(false)
  const [photoInfo, setPhotoInfo] = useState<{ name: string; sizeText: string } | null>(null)

  const photoFile = useRef<File | null>(null)
  const photoInput = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<PetFormSchema>({
    resolver: zodResolver(petSchema),
    mode: 'all',
    defaultValues: {
      nome: pet.nome,
      descricao: pet.descricao,
      especie: pet.especie,
      porte: pet.porte,
      sexo: pet.sexo,
      contato: pet.contato ? digitsOnly(pet.contato) : '',
      vacinado: pet.vacinado ?? false,
      vermifugado: pet.vermifugado ?? false,
      castrado: pet.castrado ?? false,
      microchip: pet.microchip ?? false,
    },
  })

  async function save(values: PetFormSchema) {
    if (!onUpdate || isCompressing) return
    try {
      onStart?.()

      const formData = new FormData()
      formData.append('nome', values.nome)
      formData.append('descricao', values.descricao)
      formData.append('especie', values.especie)
      formData.append('porte', values.porte)
      formData.append('sexo', values.sexo)
      formData.append('contato', values.contato)
      formData.append('vacinado', String(values.vacinado ?? false))
      formData.append('vermifugado', String(values.vermifugado ?? false))
      formData.append('castrado', String(values.castrado ?? false))
      formData.append('microchip', String(values.microchip ?? false))

      if (photoFile.current) {
        formData.append('file', photoFile.current)
      }

      await onUpdate(id, formData)
      setEditing(false)
      photoFile.current = null
      setPhotoInfo(null)
      setPhotoError('')
    } catch (error) {
      console.error('Erro ao atualizar animal:', error)
    } finally {
      onEnd?.()
    }
  }

  async function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoError('')

    // 1. Validação do formato de imagem (JPEG, JPG ou PNG)
    const validation = validateImageFile(file)
    if (!validation.valid) {
      setPhotoError(validation.error || 'Formato inválido. Apenas imagens JPEG, PNG ou JPG são permitidas.')
      photoFile.current = null
      setPhotoInfo(null)
      if (photoInput.current) photoInput.current.value = ''
      return
    }

    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2)

    // 2. Compressão se imagem for maior que 5MB
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

      // Atualizar preview local
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') setPhotoPreview(reader.result)
      }
      reader.readAsDataURL(photoFile.current)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar imagem.'
      setPhotoError(msg)
      photoFile.current = null
      setPhotoInfo(null)
      if (photoInput.current) photoInput.current.value = ''
    } finally {
      setIsCompressing(false)
    }
  }

  function toggleEdit() {
    const nextEditing = !editing
    setEditing(nextEditing)
    if (nextEditing) {
      photoFile.current = null
      setPhotoPreview(null)
      setPhotoError('')
      setPhotoInfo(null)
      reset({
        nome,
        descricao,
        especie,
        porte,
        sexo,
        contato: contato ? digitsOnly(contato) : '',
        vacinado: pet.vacinado ?? false,
        vermifugado: pet.vermifugado ?? false,
        castrado: pet.castrado ?? false,
        microchip: pet.microchip ?? false,
      })
    }
  }

  const whatsappLink = contato
    ? `https://wa.me/55${digitsOnly(contato)}?text=${encodeURIComponent(`Quero saber mais sobre o ${especie} ${nome}`)}`
    : null

  return (
    <>
      <Popup
        open={zoom}
        setOpen={setZoom}
        title={`foto ${nome}`}
        content={
          // eslint-disable-next-line @next/next/no-img-element -- remote user-uploaded photo, host not configured
          <img src={foto ?? undefined} alt={nome} className="w-full h-[calc(100vh-100px)] object-contain" />
        }
      />

      <div className="flex flex-col min-[400px]:rounded-t-[20px] rounded-0 transition-all duration-500 text-[20px] min-[400px]:w-30 w-full">
        <div
          onClick={() => {
            if (!admin) setExpanded(!expanded)
            if (admin) toggleEdit()
          }}
          className="cursor-pointer select-none min-[400px]:w-fit w-full"
        >
          <div className="bg-(--primary-color) min-[400px]:rounded-t-xl rounded-0 transition min-[400px]:w-fit w-full duration-500">
            <div className="flex justify-center items-center py-2 relative mx-4">
              {admin && editing && (
                <button
                  type="button"
                  className="absolute bg-transparent border-0 text-white text-12.5 cursor-pointer transition duration-200 z-3 text-4xl"
                  onClick={(e) => {
                    e.stopPropagation()
                    photoInput.current?.click()
                  }}
                  aria-label="Trocar foto"
                  disabled={isCompressing}
                >
                  <MdAddPhotoAlternate />
                </button>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element -- remote photo or FileReader data URL preview */}
              <img
                src={photoPreview ?? foto ?? undefined}
                alt={`um ${especie} ${sexo} ${porte}`}
                onClick={() => setZoom(true)}
                className={`${editing ? 'brightness-75' : 'brightness-100'} ${
                  expanded ? 'object-contain rounded-none ' : 'object-cover rounded-full '
                } w-24 h-24 hover:object-contain rounded-full border-8 border-(--bg-color2) hover:rounded-none mx-auto bg-white`}
              />
            </div>

            {admin && (
              <>
                <button
                  type="button"
                  onClick={toggleEdit}
                  className="m-1 py-1 px-2 text-[13pt] rounded-xl text-(--text-color) border-0 font-bold transition duration-500 cursor-pointer font-sans hover:text-white bg-white hover:bg-(--secondary-color)"
                >
                  {editing ? 'Cancelar' : 'Editar'}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete?.(id, nome)
                  }}
                  className="m-1 py-1 px-2 text-[13pt] rounded-xl text-(--text-color) border-0 font-bold transition duration-500 cursor-pointer font-sans hover:text-white bg-white hover:bg-(--secondary-color)"
                >
                  Apagar
                </button>
              </>
            )}

            <div className="mt-0.5 p-1 h-fit bg-(--bg-color2) cursor-pointer transition-all duration-300">
              <label className="text-(--text-color) font-extrabold text-base flex justify-center items-center">
                {`${nome} `}
                {sexo === 'macho' ? <IoMdMale className="text-blue-500" /> : <IoMdFemale className="text-pink-500" />}
              </label>

              {!admin ? (
                <p
                  className={`text-(--text-color) overflow-hidden transition-all ease-linear ${
                    expanded ? 'max-h-0 opacity-0 duration-0' : 'max-h-40 opacity-100 duration-300'
                  }`}
                >
                  Clique para me conhecer!
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {!admin ? (
          <div
            className={`w-full bg-(--bg-color2) text-(--text-color2) px-2 py-0 pt-0 flex flex-col ease-linear transition-opacity ${
              expanded ? 'max-h-40 duration-500 opacity-100 overflow-visible' : ' max-h-0  duration-0 overflow-hidden'
            }`}
          >
            <label className="font-bold text-[18px]">
              {especie === 'cachorro' && sexo === 'macho' && ' Cachorro de '}
              {especie === 'cachorro' && sexo === 'femea' && ' Cadela de '}
              {especie === 'gato' && sexo === 'femea' && 'Gata de '}
              {especie === 'gato' && sexo === 'macho' && 'Gato de '}
              porte {porte === 'medio' ? 'médio' : porte}
            </label>
            <p className="text-center text-[18px]">{descricao}.</p>

            {(pet.vacinado || pet.vermifugado || pet.castrado || pet.microchip) && (
              <div className="flex flex-wrap gap-1 justify-center my-1">
                {pet.vacinado && (
                  <span className="bg-green-100 text-green-800 text-[12px] px-2 py-0.5 rounded-full font-semibold">
                    Vacinado
                  </span>
                )}
                {pet.vermifugado && (
                  <span className="bg-emerald-100 text-emerald-800 text-[12px] px-2 py-0.5 rounded-full font-semibold">
                    Vermifugado
                  </span>
                )}
                {pet.castrado && (
                  <span className="bg-blue-100 text-blue-800 text-[12px] px-2 py-0.5 rounded-full font-semibold">
                    Castrado
                  </span>
                )}
                {pet.microchip && (
                  <span className="bg-purple-100 text-purple-800 text-[12px] px-2 py-0.5 rounded-full font-semibold">
                    Microchip
                  </span>
                )}
              </div>
            )}

            {whatsappLink ? (
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button
                  name={
                    <div className="flex items-center justify-center gap-1">
                      <IoLogoWhatsapp className="p-0 m-0" /> <p>Contato</p>
                    </div>
                  }
                />
              </a>
            ) : null}
          </div>
        ) : null}

        {admin ? (
          <div
            className={`p-2 w-full bg-(--bg-color2) text-(--text-color2) ease-linear transition-opacity ${
              editing ? 'max-h-fit duration-500 opacity-100' : 'max-h-0 duration-0 overflow-hidden opacity-0'
            }`}
          >
            <form onSubmit={(e) => void handleSubmit(save)(e)}>
              <input
                type="file"
                name="file"
                onChange={handlePhotoChange}
                onFocus={scrollIntoCenter}
                ref={photoInput}
                className="hidden"
                accept="image/jpeg,image/png,image/jpg"
              />

              {isCompressing && (
                <div className="flex items-center justify-center gap-1 my-2">
                  <Spinner className="w-4 h-4" />
                  <p className="text-xs text-(--text-color) font-bold animate-pulse">Comprimindo imagem (&le; 5MB)...</p>
                </div>
              )}

              {photoInfo && (
                <div className="my-1 text-center">
                  <p className="text-xs font-semibold text-(--text-color)">{photoInfo.name}</p>
                  <p className="text-[11px] text-(--text-color2)">{photoInfo.sizeText}</p>
                </div>
              )}

              {photoError && <p className="formerro text-sm">{photoError}</p>}

              <label>
                <strong>Nome:</strong>
              </label>
              <input className="input" {...register('nome', { onChange: capitalize })} type="text" />
              {errors.nome && <p className="formerro">{errors.nome.message}</p>}

              <label>
                <strong>Espécie:</strong>
              </label>
              <select className="input" {...register('especie')}>
                <option value="cachorro">Cachorro</option>
                <option value="gato">Gato</option>
              </select>
              {errors.especie && <p className="formerro">{errors.especie.message}</p>}

              <label>
                <strong>Porte:</strong>
              </label>
              <select className="input" {...register('porte')}>
                <option value="pequeno">Pequeno</option>
                <option value="medio">Médio</option>
                <option value="grande">Grande</option>
              </select>
              {errors.porte && <p className="formerro">{errors.porte.message}</p>}

              <label>
                <strong>Sexo:</strong>
              </label>
              <select className="input" {...register('sexo')}>
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
              {errors.sexo && <p className="formerro">{errors.sexo.message}</p>}

              <label>
                <strong>Descrição:</strong>
              </label>
              <textarea className="textarea" {...register('descricao', { onChange: capitalize })} />
              {errors.descricao && <p className="formerro">{errors.descricao.message}</p>}

              <label>
                <strong>Contato: </strong>
              </label>
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

              <label className="text-left font-bold text-sm text-(--text-color) mt-2 block">
                Saúde e Cuidados (opcional):
              </label>
              <div className="grid grid-cols-2 gap-1 my-1 text-left px-1">
                <label className="flex items-center gap-1 text-xs text-(--text-color2) cursor-pointer select-none">
                  <input type="checkbox" {...register('vacinado')} className="accent-(--text-color) cursor-pointer" />
                  <span>Vacinado</span>
                </label>
                <label className="flex items-center gap-1 text-xs text-(--text-color2) cursor-pointer select-none">
                  <input type="checkbox" {...register('vermifugado')} className="accent-(--text-color) cursor-pointer" />
                  <span>Vermifugado</span>
                </label>
                <label className="flex items-center gap-1 text-xs text-(--text-color2) cursor-pointer select-none">
                  <input type="checkbox" {...register('castrado')} className="accent-(--text-color) cursor-pointer" />
                  <span>Castrado</span>
                </label>
                <label className="flex items-center gap-1 text-xs text-(--text-color2) cursor-pointer select-none">
                  <input type="checkbox" {...register('microchip')} className="accent-(--text-color) cursor-pointer" />
                  <span>Microchip</span>
                </label>
              </div>

              <Button
                name={isCompressing ? 'Comprimindo...' : 'Salvar'}
                type="submit"
                className="mt-2 mx-auto"
                disabled={isCompressing}
              />
            </form>
          </div>
        ) : null}
      </div>
    </>
  )
}
