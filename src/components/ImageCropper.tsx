"use client"

import { useEffect, useState } from "react"
import Cropper, { type Area, type Point } from "react-easy-crop"
import Button from "./Button"
import Popup from "./Popup"
import { getCroppedFile } from "@/lib/cropImage"

interface ImageCropperProps {
    image: File | null
    open: boolean
    onConfirm: (file: File) => void
    onCancel: () => void
}

export default function ImageCropper({
    image,
    open,
    onConfirm,
    onCancel,
}: ImageCropperProps) {
    const [imageUrl, setImageUrl] = useState("")
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(
        null,
    )

    useEffect(() => {
        if (!image) return

        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === "string") setImageUrl(reader.result)
        }
        reader.readAsDataURL(image)

        return () => reader.abort()
    }, [image])

    async function confirmCrop() {
        if (!imageUrl || !croppedAreaPixels) return

        const source = new Image()
        source.src = imageUrl
        await source.decode()

        onConfirm(await getCroppedFile(source, croppedAreaPixels))
    }

    if (!image) return null

    return (
        <Popup
            open={open}
            setOpen={(value) => {
                if (!value) onCancel()
            }}
            title="Recortar imagem"
            content={
                <div className="w-[min(85vw,380px)] bg-(--bg-color2) p-3">
                    <div className="relative h-[min(50vh,500px)] min-h-40 overflow-hidden bg-black">
                        <Cropper
                            image={imageUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={1}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={(_, area) =>
                                setCroppedAreaPixels(area)
                            }
                        />
                    </div>

                    <label className="formlabel block py-2 text-base">
                        Zoom
                    </label>

                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(event) =>
                            setZoom(Number(event.target.value))
                        }
                        className="w-full"
                    />

                    <div className="flex gap-2">
                        <Button
                            name="Cancelar"
                            onClick={onCancel}
                            className="bg-gray-400"
                        />
                        <Button
                            name="Confirmar"
                            onClick={() => void confirmCrop()}
                        />
                    </div>
                </div>
            }
        />
    )
}
