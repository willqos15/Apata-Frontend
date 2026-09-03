'use client'

import { useRef, useState, type ChangeEvent, type FocusEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { PatternFormat } from 'react-number-format'
import { MdAddPhotoAlternate } from 'react-icons/md'
import { IoLogoWhatsapp, IoMdFemale, IoMdMale } from 'react-icons/io'
import Button from './Button'
import Popup from './Popup'
import type { Pet, PetFormValues } from '@/types'

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

export default function Item({ pet, admin, onDelete, onUpdate, onStart, onEnd }: ItemProps) {
  const { id, nome, descricao, especie, foto, porte, sexo, contato } = pet

  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const photoInput = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<PetFormValues>({
    mode: 'onChange',
    defaultValues: { nome: '', descricao: '', especie: '', porte: '', sexo: '', contato: '' },
  })

  async function save(values: PetFormValues) {
    if (!onUpdate) return
    try {
      onStart?.()

      const formData = new FormData()
      ;(Object.keys(values) as Array<keyof PetFormValues>).forEach((key) => {
        formData.append(key, values[key])
      })

      const file = photoInput.current?.files?.[0]
      if (file) formData.append('file', file)

      await onUpdate(id, formData)
    } catch (error) {
      console.error(error)
    } finally {
      onEnd?.()
    }
  }

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  function toggleEdit() {
    setEditing(!editing)
    reset({ nome, descricao, especie, porte, sexo, contato: digitsOnly(contato) })
  }

  const whatsappLink = `https://wa.me/55${digitsOnly(contato)}?text=${encodeURIComponent(
    `Quero saber mais sobre o ${especie} ${nome}`,
  )}`

  return (
    <>
      <Popup
        open={zoom}
        setOpen={setZoom}
        title={`foto ${nome}`}
        content={
          // eslint-disable-next-line @next/next/no-img-element -- remote user-uploaded photo, host not configured
          <img src={foto} alt={nome} className="w-full h-[calc(100vh-100px)] object-contain" />
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
                  className="absolute bg-transparent border-0 text-white text-12.5 cursor-pointer transitionduration-200 z-3 text-4xl"
                  onClick={(e) => {
                    e.stopPropagation()
                    photoInput.current?.click()
                  }}
                  aria-label="Trocar foto"
                >
                  <MdAddPhotoAlternate />
                </button>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element -- remote photo or FileReader data URL preview */}
              <img
                src={photoPreview ?? foto}
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
                  Editar
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

            <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
              <Button
                name={
                  <div className="flex items-center justify-center gap-1">
                    <IoLogoWhatsapp className="p-0 m-0" /> <p>Contato</p>
                  </div>
                }
              />
            </a>
          </div>
        ) : null}

        {admin ? (
          <div
            className={`p-2 w-full bg-(--bg-color2) text-(--text-color2) ease-linear transition-opacity ${
              editing ? 'max-h-fit duration-500 opacity-100' : 'max-h-0 duration-0 overflow-hidden opacity-0'
            }`}
          >
            <form onSubmit={(e) => void handleSubmit(save)(e)}>
              <input type="file" name="file" onChange={handlePhotoChange} onFocus={scrollIntoCenter} ref={photoInput} className="hidden" />

              <label>
                <strong>Nome:</strong>
              </label>
              <input className="input" {...register('nome', { required: true, onChange: capitalize })} type="text" />
              {errors.nome && <p>Campo obrigatório</p>}

              <label>
                <strong>Espécie:</strong>
              </label>
              <select className="input" {...register('especie', { required: true })}>
                <option value="">Selecione</option>
                <option value="cachorro">Cachorro</option>
                <option value="gato">Gato</option>
              </select>
              {errors.especie && <p>Campo obrigatório</p>}

              <label>
                <strong>Porte:</strong>
              </label>
              <select className="input" {...register('porte', { required: true })}>
                <option value="">Selecione</option>
                <option value="pequeno">Pequeno</option>
                <option value="medio">Médio</option>
                <option value="grande">Grande</option>
              </select>
              {errors.porte && <p>Campo obrigatório</p>}

              <label>
                <strong>Sexo:</strong>
              </label>
              <select className="input" {...register('sexo', { required: true })}>
                <option value="">Selecione</option>
                <option value="macho">Macho</option>
                <option value="femea">Fêmea</option>
              </select>
              {errors.sexo && <p>Campo obrigatório</p>}

              <label>
                <strong>Descrição:</strong>
              </label>
              <textarea className="textarea" {...register('descricao', { required: true, onChange: capitalize })} />
              {errors.descricao && <p>Campo obrigatório</p>}

              <label>
                <strong>Contato: </strong>
              </label>
              <Controller
                name="contato"
                control={control}
                rules={{
                  required: 'Campo obrigatório',
                  validate: (value) => {
                    if (!value) return 'Campo obrigatório'
                    return digitsOnly(value).length === 11 || 'Número inválido'
                  },
                }}
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
              {errors.contato && <p>{errors.contato.message}</p>}

              <Button name="Salvar" type="submit" className="mt-2 mx-auto" />
            </form>
          </div>
        ) : null}
      </div>
    </>
  )
}
