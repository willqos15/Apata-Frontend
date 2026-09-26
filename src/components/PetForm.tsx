'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PatternFormat } from 'react-number-format'
import Button from './Button'
import ImageCropper from './ImageCropper'
import Spinner from './Spinner'
import { createPet } from '@/lib/api'
import { scrollIntoCenter } from '@/lib/focus'
import { petFormSchema } from '@/schemas/pet-form-schema'

const DEFAULT_PHONE = '93991185009'

type SubmitStatus = 'inicio' | 'load'
type SubmitMessage = '' | 'ok' | 'erro'
type PetFormValues = z.input<typeof petFormSchema>

const EMPTY_VALUES: PetFormValues = {
  nome: '',
  especie: '',
  porte: '',
  sexo: '',
  descricao: '',
  contato: DEFAULT_PHONE,
  vacinado: false,
  vermifugado: false,
  castrado: false,
}

// Subcomponente para eliminar a repetição dos três <select> com estrutura idêntica.
function SelectField({
  label,
  options,
  error,
  ...registerProps
}: {
  label: string
  options: { value: string; label: string }[]
  error?: string
  name: keyof PetFormValues
  onChange: React.ChangeEventHandler
  onBlur: React.FocusEventHandler
  ref: React.Ref<HTMLSelectElement>
}) {
  return (
    <>
      <label className="formlabel">{label}</label>
      <select className="input" {...registerProps}>
        <option value="">Selecione</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="formerro">{error}</p>}
    </>
  )
}

export default function PetForm() {
  const photoFile = useRef<File | null>(null)
  const photoInput = useRef<HTMLInputElement>(null)
  const [photoError, setPhotoError] = useState<'' | 'erro'>('')
  const [fileName, setFileName] = useState('')
  const [cropSource, setCropSource] = useState<File | null>(null)
  const [cropOpen, setCropOpen] = useState(false)
  const [message, setMessage] = useState<SubmitMessage>('')
  const [status, setStatus] = useState<SubmitStatus>('inicio')

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    resetField,
  } = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    mode: 'all',
    defaultValues: EMPTY_VALUES,
  })

  function isPhotoValid(): boolean {
    if (!photoFile.current) {
      setPhotoError('erro')
      return false
    }
    setPhotoError('')
    return true
  }

  function resetPhoto() {
    if (photoInput.current) photoInput.current.value = ''
    photoFile.current = null
    setFileName('')
    setPhotoError('')
  }

  async function submit(values: PetFormValues) {
    if (status !== 'inicio') return
    if (!isPhotoValid()) return

    setStatus('load')

    const formData = new FormData()
    formData.append('nome', values.nome)
    formData.append('especie', values.especie)
    formData.append('porte', values.porte)
    formData.append('sexo', values.sexo)
    formData.append('descricao', values.descricao)
    formData.append('vacinado', values.vacinado ? 'true' : 'false')
    formData.append('vermifugado', values.vermifugado ? 'true' : 'false')
    formData.append('castrado', values.castrado ? 'true' : 'false')
    if (photoFile.current) formData.append('file', photoFile.current)
    formData.append('contato', values.contato)

    try {
      await createPet(formData)
      resetField('nome', { defaultValue: '' })
      resetField('especie', { defaultValue: '' })
      resetField('porte', { defaultValue: '' })
      resetField('sexo', { defaultValue: '' })
      resetField('descricao', { defaultValue: '' })
      resetField('contato', { defaultValue: values.contato })
      resetPhoto()
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

    setCropSource(file)
    setCropOpen(true)
  }

  function cancelCrop() {
    setCropOpen(false)
    setCropSource(null)

    if (photoInput.current) photoInput.current.value = ''
  }
  function confirmCrop(file: File) {
    photoFile.current = file
    setFileName(file.name)
    setPhotoError('')
    setCropOpen(false)
    setCropSource(null)

    if (photoInput.current) photoInput.current.value = ''
  }

  return (
    <div className="pt-10 relative min-h-screen">
      <ImageCropper
        key={
          cropSource
            ? `${cropSource.name}-${cropSource.lastModified}`
            : 'cropper'
        }
        image={cropSource}
        open={cropOpen}
        onConfirm={confirmCrop}
        onCancel={cancelCrop}
      />

      <form
        onSubmit={(e) => void handleSubmit(submit)(e)}
        className="flex flex-col max-w-72 px-5 my-10 mx-auto justify-start rounded-2xl bg-(--bg-color2)"
      >
        <fieldset disabled={status !== 'inicio'} className="flex flex-col">
          <label className="formlabel"> Nome do animal:</label>
          <input className="input" {...register('nome')} type="text" placeholder="Nome do animal." onFocus={scrollIntoCenter} />
          {errors.nome && <p className="formerro">{errors.nome.message}</p>}

          <label className="formlabel"> Carregue uma imagem:</label>

          <Button name="Escolha sua imagem" onClick={() => photoInput.current?.click()} size={15} />

          <input type="file" ref={photoInput} onChange={handleFileChange} onFocus={scrollIntoCenter} className="hidden" accept="image/*" />

          <p className="pl-2.5 text-[16px] text-(--text-color)">{fileName}</p>

          {photoError === 'erro' && <p className="formerro">Campo obrigatório</p>}

          <SelectField
            label="Espécie"
            options={[
              { value: 'cachorro', label: 'Cachorro' },
              { value: 'gato', label: 'Gato' },
            ]}
            error={errors.especie?.message}
            {...register('especie')}
          />

          <SelectField
            label="Porte"
            options={[
              { value: 'pequeno', label: 'Pequeno' },
              { value: 'medio', label: 'Médio' },
              { value: 'grande', label: 'Grande' },
            ]}
            error={errors.porte?.message}
            {...register('porte')}
          />

          <SelectField
            label="Sexo"
            options={[
              { value: 'macho', label: 'Macho' },
              { value: 'femea', label: 'Fêmea' },
            ]}
            error={errors.sexo?.message}
            {...register('sexo')}
          />

          <label className="formlabel"> Sobre:</label>
          <textarea
            className="textarea max-h-16"
            {...register('descricao')}
            rows={2}
            placeholder="Idade, castrado, deficiência e etc."
            onFocus={scrollIntoCenter}
          />
          {errors.descricao && <p className="formerro">{errors.descricao.message}</p>}

          <div className="flex flex-col gap-2 my-4 text-(--text-color)">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('vacinado')} className="w-5 h-5 accent-(--bg-color)" />
              <span className="text-[16px] font-bold">Vacinado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('vermifugado')} className="w-5 h-5 accent-(--bg-color)" />
              <span className="text-[16px] font-bold">Vermifugado</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" {...register('castrado')} className="w-5 h-5 accent-(--bg-color)" />
              <span className="text-[16px] font-bold">Castrado</span>
            </label>
          </div>

          <label className="formlabel"> Contato:</label>
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
        </fieldset>

        {errors.contato && <p className="formerro">{errors.contato.message}</p>}

        <br />
        <Button
          name={status === 'inicio' ? 'Salvar' : 'Salvando...'}
          type="submit"
          size={20}
          disabled={status !== 'inicio'}
        />
      </form>

      {status === 'load' && <Spinner className="mx-auto m-4" />}

      {message === 'ok' && status !== 'load' && <p className="p-2 text-base text-green-600 font-bold"> Cadastro feito com sucesso!</p>}
      {message === 'erro' && status !== 'load' && <p className="pt-10 text-base text-[rgb(128,0,0)] font-bold"> Erro ao cadastrar!</p>}
    </div>
  )
}
