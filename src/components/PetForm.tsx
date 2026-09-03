'use client'

import { useRef, useState, type ChangeEvent, type FocusEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { PatternFormat } from 'react-number-format'
import Button from './Button'
import Spinner from './Spinner'
import { createPet } from '@/lib/api'
import type { PetFormValues } from '@/types'

const DEFAULT_PHONE = '93991185009'

type SubmitStatus = 'inicio' | 'load'
type SubmitMessage = '' | 'ok' | 'erro'

const INITIAL_VALUES: PetFormValues = {
  nome: '',
  especie: '',
  porte: '',
  sexo: '',
  descricao: '',
  contato: DEFAULT_PHONE,
}

function scrollIntoCenter(e: FocusEvent<HTMLElement>) {
  const target = e.target
  setTimeout(() => {
    target.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}

export default function PetForm() {
  const photoFile = useRef<File | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const [photoError, setPhotoError] = useState<'' | 'erro'>('')
  const [fileName, setFileName] = useState('')
  const [message, setMessage] = useState<SubmitMessage>('')
  const [status, setStatus] = useState<SubmitStatus>('inicio')

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PetFormValues>({ mode: 'all', defaultValues: INITIAL_VALUES })

  function hasPhotoError(): boolean {
    if (!photoFile.current) {
      setPhotoError('erro')
      return true
    }
    setPhotoError('')
    return false
  }

  async function submit(values: PetFormValues) {
    if (status !== 'inicio') return
    if (hasPhotoError()) return

    setStatus('load')

    const formData = new FormData()
    formData.append('nome', values.nome)
    formData.append('especie', values.especie)
    formData.append('porte', values.porte)
    formData.append('sexo', values.sexo)
    formData.append('descricao', values.descricao)
    if (photoFile.current) formData.append('file', photoFile.current)
    formData.append('contato', values.contato)

    try {
      await createPet(formData)
      reset(INITIAL_VALUES)
      if (fileInput.current) fileInput.current.value = ''
      photoFile.current = null
      setFileName('')
      setPhotoError('')
      setStatus('inicio')
      setMessage('ok')
    } catch (error) {
      console.error(error)
      setStatus('inicio')
      setMessage('erro')
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    photoFile.current = file
    setFileName(file.name)
    setPhotoError('')
  }

  return (
    <div className="pt-10 relative min-h-screen">
      <form
        onSubmit={(e) => void handleSubmit(submit)(e)}
        className="flex flex-col max-w-72 px-5 my-10 mx-auto justify-start rounded-2xl bg-(--bg-color2)"
      >
        <fieldset disabled={status !== 'inicio'} className="flex flex-col">
          <label className="formlabel"> Nome do animal:</label>
          <input className="input" {...register('nome', { required: true })} type="text" placeholder="Nome do animal." onFocus={scrollIntoCenter} />
          {errors.nome && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel"> Carregue uma imagem:</label>

          <Button name="Escolha sua imagem" onClick={() => fileInput.current?.click()} size={15} />

          <input type="file" ref={fileInput} onChange={handleFileChange} onFocus={scrollIntoCenter} className="hidden" accept="image/*" />

          <p className="pl-2.5 text-[16px] text-(--text-color)">{fileName}</p>

          {photoError === 'erro' && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel">Espécie</label>
          <select className="input" {...register('especie', { required: true })}>
            <option value="">Selecione</option>
            <option value="cachorro">Cachorro</option>
            <option value="gato">Gato</option>
          </select>
          {errors.especie && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel">Porte</label>
          <select className="input" {...register('porte', { required: true })}>
            <option value="">Selecione</option>
            <option value="pequeno">Pequeno</option>
            <option value="medio">Médio</option>
            <option value="grande">Grande</option>
          </select>
          {errors.porte && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel">Sexo</label>
          <select className="input" {...register('sexo', { required: true })}>
            <option value="">Selecione</option>
            <option value="macho">Macho</option>
            <option value="femea">Fêmea</option>
          </select>
          {errors.sexo && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel"> Sobre:</label>
          <textarea
            className="textarea max-h-16"
            {...register('descricao', { required: true })}
            rows={2}
            placeholder="Idade, castrado, deficiência e etc."
            onFocus={scrollIntoCenter}
          />
          {errors.descricao && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel"> Contato:</label>
          <Controller
            name="contato"
            control={control}
            rules={{
              required: 'Campo obrigatório',
              validate: (value) => value.replace(/\D/g, '').length === 11 || 'O número precisa ter 11 dígitos',
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
        </fieldset>

        {errors.contato && <p className="formerro">{errors.contato.message}</p>}

        <br />
        <Button
          name={status === 'inicio' ? 'Salvar' : 'Salvando...'}
          type="submit"
          size={20}
          disabled={status !== 'inicio'}
          className={status === 'inicio' ? '' : 'cursor-default bg-gray-300 text-gray-600 hover:bg-gray-300 hover:text-gray-600'}
        />
      </form>

      {status === 'load' && <Spinner className="mx-auto m-4" />}

      {message === 'ok' && status !== 'load' && <p className="p-2 text-base text-green-600 font-bold"> Cadastro feito com sucesso!</p>}
      {message === 'erro' && status !== 'load' && <p className="pt-10 text-base text-[rgb(128,0,0)] font-bold"> Erro ao cadastrar!</p>}
    </div>
  )
}
