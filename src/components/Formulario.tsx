'use client'

import { useRef, useState, type ChangeEvent, type FocusEvent } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { PatternFormat } from 'react-number-format'
import Button from './Button'
import Spinner from './Spinner'
import { criarPet } from '@/lib/api'
import type { PetFormValues } from '@/types'

const TEL_PADRAO = '93991185009'

type Estado = 'inicio' | 'load'
type Msg = '' | 'ok' | 'erro'

const VALORES_INICIAIS: PetFormValues = {
  nome: '',
  especie: '',
  porte: '',
  sexo: '',
  descricao: '',
  contato: TEL_PADRAO,
}

function scrollarParaCentro(e: FocusEvent<HTMLElement>) {
  const alvo = e.target
  setTimeout(() => {
    alvo.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}

export default function Formulario() {
  const foto = useRef<File | null>(null)
  const inputFile = useRef<HTMLInputElement>(null)

  const [msgfoto, setMsgFoto] = useState<'' | 'erro'>('')
  const [nomearq, setNomeArq] = useState('')
  const [msg, setMsg] = useState<Msg>('')
  const [estado, setEstado] = useState<Estado>('inicio')

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<PetFormValues>({ mode: 'all', defaultValues: VALORES_INICIAIS })

  function errofotos(): boolean {
    if (!foto.current) {
      setMsgFoto('erro')
      return true
    }
    setMsgFoto('')
    return false
  }

  async function enviar(dados: PetFormValues) {
    if (estado !== 'inicio') return
    if (errofotos()) return

    setEstado('load')

    const formData = new FormData()
    formData.append('nome', dados.nome)
    formData.append('especie', dados.especie)
    formData.append('porte', dados.porte)
    formData.append('sexo', dados.sexo)
    formData.append('descricao', dados.descricao)
    if (foto.current) formData.append('file', foto.current)
    formData.append('contato', dados.contato)

    try {
      await criarPet(formData)
      reset(VALORES_INICIAIS)
      if (inputFile.current) inputFile.current.value = ''
      foto.current = null
      setNomeArq('')
      setMsgFoto('')
      setEstado('inicio')
      setMsg('ok')
    } catch (erro) {
      console.error(erro)
      setEstado('inicio')
      setMsg('erro')
    }
  }

  function uploading(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    if (!arquivo) return
    foto.current = arquivo
    setNomeArq(arquivo.name)
    setMsgFoto('')
  }

  return (
    <div className="pt-10 relative min-h-screen">
      <form
        onSubmit={(e) => void handleSubmit(enviar)(e)}
        className="flex flex-col max-w-72 px-5 my-10 mx-auto justify-start rounded-2xl bg-(--bg-color2)"
      >
        <fieldset disabled={estado !== 'inicio'} className="flex flex-col">
          <label className="formlabel"> Nome do animal:</label>
          <input className="input" {...register('nome', { required: true })} type="text" placeholder="Nome do animal." onFocus={scrollarParaCentro} />
          {errors.nome && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel"> Carregue uma imagem:</label>

          <Button name="Escolha sua imagem" func={() => inputFile.current?.click()} size={15} />

          <input type="file" ref={inputFile} onChange={uploading} onFocus={scrollarParaCentro} className="hidden" accept="image/*" />

          <p className="pl-2.5 text-[16px] text-(--text-color)">{nomearq}</p>

          {msgfoto === 'erro' && <p className="formerro">Campo obrigatório</p>}

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
            onFocus={scrollarParaCentro}
          />
          {errors.descricao && <p className="formerro">Campo obrigatório</p>}

          <label className="formlabel"> Contato:</label>
          <Controller
            name="contato"
            control={control}
            rules={{
              required: 'Campo obrigatório',
              validate: (valor) => valor.replace(/\D/g, '').length === 11 || 'O número precisa ter 11 dígitos',
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
        </fieldset>

        {errors.contato && <p className="formerro">{errors.contato.message}</p>}

        <br />
        <Button
          name={estado === 'inicio' ? 'Salvar' : 'Salvando...'}
          type="submit"
          size={20}
          disabled={estado !== 'inicio'}
          className={estado === 'inicio' ? '' : 'cursor-default bg-gray-300 text-gray-600 hover:bg-gray-300 hover:text-gray-600'}
        />
      </form>

      {estado === 'load' && <Spinner className="mx-auto m-4" />}

      {msg === 'ok' && estado !== 'load' && <p className="p-2 text-base text-green-600 font-bold"> Cadastro feito com sucesso!</p>}
      {msg === 'erro' && estado !== 'load' && <p className="pt-10 text-base text-[rgb(128,0,0)] font-bold"> Erro ao cadastrar!</p>}
    </div>
  )
}
