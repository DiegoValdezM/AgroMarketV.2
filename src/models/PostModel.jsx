// src/models/PostModel.js
import { db, auth } from '../../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default class PostModel {
  /**
   * Sube una imagen a Azure Blob Storage usando SAS token
   * @param {string} uri - URI local del archivo (por ejemplo, imagen desde FilePicker)
   * @returns {Promise<string>} URL pública del archivo subido
   */
  static async uploadImage(uri) {
    const sasToken = "sv=2024-11-04&ss=bfqt&srt=co&sp=rwdlacupiytfx&se=2025-06-14T13:38:33Z&st=2025-06-12T05:38:33Z&spr=https&sig=vvO7VZRuFLCxkeiVGnoS00BKEm7TPh0Vuzj7vAwDTb4%3D";
    const accountName = "solicitudesarchivos";
    const containerName = "solicitudesarchivos";

    try {
      // 1. Obtener blob desde la URI
      const response = await fetch(uri);
      if (!response.ok) {
        throw new Error(`Fetch fallido. Status: ${response.status}`);
      }
      const blob = await response.blob();
      const contentType = blob.type || 'application/octet-stream';

      // 2. Generar nombre único para el archivo
      const timestamp = new Date().getTime();
      const randomStr = Math.random().toString(36).substring(2, 8);
      const fileName = `posts/${timestamp}_${randomStr}`;

      // 3. Construir URL destino con SAS token
      const azureURL = `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}?${sasToken}`;

      // 4. Subir archivo con método PUT
      const uploadRes = await fetch(azureURL, {
        method: "PUT",
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": contentType
        },
        body: blob
      });

      if (!uploadRes.ok) {
        throw new Error(`Error al subir a Azure. Status: ${uploadRes.status}`);
      }

      // 5. URL pública del blob
      const publicURL = `https://${accountName}.blob.core.windows.net/${containerName}/${fileName}`;
      console.log("[PostModel.uploadImage] Subido exitosamente a Azure:", publicURL);
      return publicURL;

    } catch (error) {
      console.error('[PostModel.uploadImage] Error subiendo imagen a Azure:', error);
      throw new Error('azure-image-upload-failed');
    }
  }

  static async createPost(postData) {
    try {
      if (!postData.userId) {
        console.error("[PostModel.createPost] userId es requerido.");
        throw new Error('user-id-required');
      }

      const postWithMetadata = {
        ...postData,
        createdAt: serverTimestamp(),
        status: 'active',
        views: 0
      };

      const docRef = await addDoc(collection(db, 'posts'), postWithMetadata);
      console.log('[PostModel.createPost] Post creado con ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('[PostModel.createPost] Error creando post:', error);
      throw new Error('post-creation-failed');
    }
  }

  static getCurrentUser() {
    if (!auth) {
      console.warn("[PostModel.getCurrentUser] La instancia 'auth' no está inicializada.");
      return null;
    }
    return auth.currentUser;
  }
}
