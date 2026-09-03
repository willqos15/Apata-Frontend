'use client'

import { useRef, useState, type ChangeEvent, type FocusEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { PatternFormat } from 'react-number-format'
import { MdAddPhotoAlternate } from 'react-icons/md'
import { IoLogoWhatsapp, IoMdFemale, IoMdMale } from 'react-icons/io'
import Button from './Button'
import Poup from './Poup'
import type { Pet, PetFormValues } from '@/types'

interface ItemProps {
  pet: Pet
  admin: boolean
  onDelete?: (id: Pet['id'], nome: string) => void
  onUpdate?: (id: Pet['id'], dados: FormData) => Promise<unknown>
  onStart?: () => void
  onEnd?: () => void
}

function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '')
}

function scrollarParaCentro(e: FocusEvent<HTMLElement>) {
  const alvo = e.target
  setTimeout(() => {
    alvo.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}

function capitalizar(e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.target.value = e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1)
}

export default function Item({ pet, admin, onDelete, onUpdate, onStart, onEnd }: ItemProps) {
  const { id, nome, descricao, especie, foto, porte, sexo, contato } = pet

  const [aberto, setAberto] = useState(false)
  const [editando, setEditando] = useState(false)
  const [zoom, setZoom] = useState(false)
  const [fotoUp, setFotoUp] = useState<string | null>(null)
  const inputFoto = useRef<HTMLInputElement>(null)

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

  async function salvar(dados: PetFormValues) {
    if (!onUpdate) return
    try {
      onStart?.()

      const formData = new FormData()
      ;(Object.keys(dados) as Array<keyof PetFormValues>).forEach((key) => {
        formData.append(key, dados[key])
      })

      const arquivo = inputFoto.current?.files?.[0]
      if (arquivo) formData.append('file', arquivo)

      await onUpdate(id, formData)
    } catch (erro) {
      console.error(erro)
    } finally {
      onEnd?.()
    }
  }

  function uploading(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return

    const leitor = new FileReader()
    leitor.onload = () => {
      if (typeof leitor.result === 'string') setFotoUp(leitor.result)
    }
    leitor.readAsDataURL(arquivo)
  }

  function editar() {
    setEditando(!editando)
    reset({ nome, descricao, especie, porte, sexo, contato: somenteDigitos(contato) })
  }

  const linkWhatsapp = `https://wa.me/55${somenteDigitos(contato)}?text=${encodeURIComponent(
    `Quero saber mais sobre o ${especie} ${nome}`,
  )}`

  return (
    <>
      <Poup
        show={zoom}
        setShow={setZoom}
        titulo={`foto ${nome}`}
        conteudo={
          // eslint-disable-next-line @next/next/no-img-element -- remote user-uploaded photo, host not configured (D6)
          <img src={foto} alt={nome} className="w-full h-[calc(100vh-100px)] object-contain" />
        }
      />

      <div className="flex flex-col min-[400px]:rounded-t-[20px] rounded-0 transition-all duration-500 text-[20px] min-[400px]:w-30 w-full">
        <div
          onClick={() => {
            if (!admin) setAberto(!aberto)
            if (admin) editar()
          }}
          className="cursor-pointer select-none min-[400px]:w-fit w-full"
        >
          <div className="bg-(--primary-color) min-[400px]:rounded-t-xl rounded-0 transition min-[400px]:w-fit w-full duration-500">
            <div className="flex justify-center items-center py-2 relative mx-4">
              {admin && editando && (
                <button
                  type="button"
                  className="absolute bg-transparent border-0 text-white text-12.5 cursor-pointer transitionduration-200 z-3 text-4xl"
                  onClick={(e) => {
                    e.stopPropagation()
                    inputFoto.current?.click()
                  }}
                  aria-label="Trocar foto"
                >
                  <MdAddPhotoAlternate />
                </button>
              )}

              {/* eslint-disable-next-line @next/next/no-img-element -- remote photo or FileReader data URL preview (D6) */}
              <img
                src={fotoUp ?? foto}
                alt={`um ${especie} ${sexo} ${porte}`}
                onClick={() => setZoom(true)}
                className={`${editando ? 'brightness-75' : 'brightness-100'} ${
                  aberto ? 'object-contain rounded-none ' : 'object-cover rounded-full '
                } w-24 h-24 hover:object-contain rounded-full border-8 border-(--bg-color2) hover:rounded-none mx-auto bg-white`}
              />
            </div>

            {admin && (
              <>
                <button
                  type="button"
                  onClick={editar}
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
                    aberto ? 'max-h-0 opacity-0 duration-0' : 'max-h-40 opacity-100 duration-300'
                  }`}
                >
                  Clique para me conhecer!
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {/* Visitor view */}
        {!admin ? (
          <div
            className={`w-full bg-(--bg-color2) text-(--text-color2) px-2 py-0 pt-0 flex flex-col ease-linear transition-opacity ${
              aberto ? 'max-h-40 duration-500 opacity-100 overflow-visible' : ' max-h-0  duration-0 overflow-hidden'
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

            <a href={linkWhatsapp} target="_blank" rel="noopener noreferrer">
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

        {/* Admin edit form */}
        {admin ? (
          <div
            className={`p-2 w-full bg-(--bg-color2) text-(--text-color2) ease-linear transition-opacity ${
              editando ? 'max-h-fit duration-500 opacity-100' : 'max-h-0 duration-0 overflow-hidden opacity-0'
            }`}
          >
            {/* handleSubmit(salvar) is built inside the handler, not during render: `salvar`
                reads inputFoto.current, and calling it during render trips react-hooks/refs. */}
            <form onSubmit={(e) => void handleSubmit(salvar)(e)}>
              <input type="file" name="file" onChange={uploading} onFocus={scrollarParaCentro} ref={inputFoto} className="hidden" />

              <label>
                <strong>Nome:</strong>
              </label>
              <input className="input" {...register('nome', { required: true, onChange: capitalizar })} type="text" />
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
              <textarea className="textarea" {...register('descricao', { required: true, onChange: capitalizar })} />
              {errors.descricao && <p>Campo obrigatório</p>}

              <label>
                <strong>Contato: </strong>
              </label>
              <Controller
                name="contato"
                control={control}
                rules={{
                  required: 'Campo obrigatório',
                  validate: (valor) => {
                    if (!valor) return 'Campo obrigatório'
                    return somenteDigitos(valor).length === 11 || 'Número inválido'
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
                    onFocus={scrollarParaCentro}
                    inputMode="numeric"
                    onValueChange={(valores) => onChange(valores.value)}
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
