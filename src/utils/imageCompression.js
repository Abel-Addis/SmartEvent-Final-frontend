/**
 * Compress an image file to reduce its size
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Maximum width (default: 1920)
 * @param {number} options.maxHeight - Maximum height (default: 1080)
 * @param {number} options.quality - Image quality 0-1 (default: 0.8)
 * @param {string} options.mimeType - Output mime type (default: 'image/jpeg')
 * @returns {Promise<File>} Compressed image file
 */
export async function compressImage(file, options = {}) {
    const {
        maxWidth = 1920,
        maxHeight = 1080,
        quality = 0.8,
        mimeType = 'image/jpeg'
    } = options

    return new Promise((resolve, reject) => {
        // Check if file is an image
        if (!file.type.startsWith('image/')) {
            reject(new Error('File is not an image'))
            return
        }

        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()

            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                let width = img.width
                let height = img.height

                if (width > maxWidth) {
                    height = (height * maxWidth) / width
                    width = maxWidth
                }

                if (height > maxHeight) {
                    width = (width * maxHeight) / height
                    height = maxHeight
                }

                // Create canvas and draw resized image
                const canvas = document.createElement('canvas')
                canvas.width = width
                canvas.height = height

                const ctx = canvas.getContext('2d')
                ctx.drawImage(img, 0, 0, width, height)

                // Convert canvas to blob
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas to Blob conversion failed'))
                            return
                        }

                        // Create new file from blob
                        const compressedFile = new File(
                            [blob],
                            file.name,
                            {
                                type: mimeType,
                                lastModified: Date.now()
                            }
                        )

                        // Log compression results
                        const originalSize = (file.size / 1024 / 1024).toFixed(2)
                        const compressedSize = (compressedFile.size / 1024 / 1024).toFixed(2)
                        const reduction = (((file.size - compressedFile.size) / file.size) * 100).toFixed(1)

                        console.log(`Image compressed: ${originalSize}MB → ${compressedSize}MB (${reduction}% reduction)`)

                        resolve(compressedFile)
                    },
                    mimeType,
                    quality
                )
            }

            img.onerror = () => {
                reject(new Error('Failed to load image'))
            }

            img.src = e.target.result
        }

        reader.onerror = () => {
            reject(new Error('Failed to read file'))
        }

        reader.readAsDataURL(file)
    })
}

/**
 * Compress multiple images
 * @param {File[]} files - Array of image files
 * @param {Object} options - Compression options
 * @returns {Promise<File[]>} Array of compressed image files
 */
export async function compressImages(files, options = {}) {
    const compressionPromises = files.map(file => compressImage(file, options))
    return Promise.all(compressionPromises)
}
