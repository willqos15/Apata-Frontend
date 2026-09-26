export interface CropArea {
    x: number
    y: number
    width: number
    height: number
}

const MAX_SIZE = 1080

export function getCroppedFile(
    image: HTMLImageElement,
    area: CropArea,
): Promise<File> {
    const scale = Math.min(1, MAX_SIZE / area.width)
    const canvas = document.createElement("canvas")

    canvas.width = Math.round(area.width * scale)
    canvas.height = Math.round(area.height * scale)

    const context = canvas.getContext("2d")
    if (!context) return Promise.reject(new Error("Canvas indisponível"))

    context.fillStyle = "#fff"
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(
        image,
        area.x,
        area.y,
        area.width,
        area.height,
        0,
        0,
        canvas.width,
        canvas.height,
    )

    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(new Error("Não foi possível gerar a imagem"))
                    return
                }

                resolve(
                    new File([blob], "pet-cropped.jpg", { type: "image/jpeg" }),
                )
            },
            "image/jpeg",
            0.88,
        )
    })
}
