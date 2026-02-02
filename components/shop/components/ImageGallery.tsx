"use client";

import { Image } from "@heroui/image";
import { useState } from "react";
import { Modal, ModalContent, ModalBody } from "@heroui/modal";

import { ImageGalleryConfig } from "@/types/shop";
import { BaseComponentProps } from "@/types/shop-components";

export default function ImageGallery({
  config,
}: BaseComponentProps<ImageGalleryConfig>) {
  const {
    images = [
      { url: "/api/placeholder/600/400", alt: "Gallery Image 1" },
      { url: "/api/placeholder/600/400", alt: "Gallery Image 2" },
      { url: "/api/placeholder/600/400", alt: "Gallery Image 3" },
    ],
    columns = 3,
    aspectRatio = "landscape",
  } = config as ImageGalleryConfig;

  const [selectedImage, setSelectedImage] = useState<ImageGalleryConfig["images"][0] | null>(null);

  const gridCols =
    {
      2: "grid-cols-1 md:grid-cols-2",
      3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
      4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    }[columns] || "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  const aspectClasses = {
    square: "aspect-square",
    landscape: "aspect-video",
    portrait: "aspect-[3/4]",
  }[aspectRatio];

  return (
    <>
      <div className="py-12 px-6">
        <div className={`grid ${gridCols} gap-4 max-w-7xl mx-auto`}>
          {images.map((image, index) => (
            <div
              key={index}
              className={`relative overflow-hidden rounded-xl ${aspectClasses} cursor-pointer group/image`}
              onClick={() => setSelectedImage(image)}
            >
              <Image
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-110"
                height="100%"
                src={image.url || "https://placehold.co/600x400/EEE/31343C"}
                width="100%"
                isZoomed={false} // Disable default zoom to handle it with modal
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-10" />
              {image.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/30 text-white p-3 backdrop-blur-sm z-20">
                  <p className="text-sm font-medium">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={!!selectedImage}
        onClose={() => setSelectedImage(null)}
        size="5xl"
        backdrop="blur"
        classNames={{
          base: "bg-transparent shadow-none",
          closeButton: "z-50 top-4 right-4 bg-black/20 hover:bg-black/40 text-white"
        }}
        motionProps={{
          variants: {
            enter: {
              y: 0,
              opacity: 1,
              transition: {
                duration: 0.3,
                ease: "easeOut",
              },
            },
            exit: {
              y: -20,
              opacity: 0,
              transition: {
                duration: 0.2,
                ease: "easeIn",
              },
            },
          }
        }}
      >
        <ModalContent>
          {(onClose) => (
            <ModalBody className="p-0 overflow-hidden flex items-center justify-center min-h-[50vh]">
              {selectedImage && (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <Image
                    alt={selectedImage.alt}
                    src={selectedImage.url || "https://placehold.co/600x400/EEE/31343C"}
                    className="w-full h-auto max-h-[85vh] object-contain"
                  />
                  {selectedImage.caption && (
                    <div className="mt-4 bg-black/50 text-white px-6 py-2 rounded-full backdrop-blur-md">
                      <p className="text-base font-medium">{selectedImage.caption}</p>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
