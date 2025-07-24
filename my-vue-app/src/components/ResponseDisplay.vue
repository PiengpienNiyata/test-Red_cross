<template>
  <div>
    <div ref="pdfContent">
      <h1>My PDF Document (Composition API)</h1>
      <p>This is some text inside my Vue component that will be saved into a PDF file.</p>
      <p>Here is some more content, including an image:</p>
      <img src="https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.depa.or.th%2Fth%2Farticle-view%2F20211008_05&psig=AOvVaw2uf6zNlxfiNoSvvSc7KeOM&ust=1753333277507000&source=images&cd=vfe&opi=89978449&ved=0CBUQjRxqFwoTCMCP2sKa0o4DFQAAAAAdAAAAABAE" alt="Placeholder Image" />
    </div>

    <hr />

    <button @click="generatePdf">Generate PDF</button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import html2pdf from 'html2pdf.js';

// 1. Create a template ref to hold the DOM element.
//    It's typed as `HTMLElement | null` because it's `null` until the component mounts.
const pdfContent = ref<HTMLElement | null>(null);

// 2. Define the function to generate the PDF.
const generatePdf = () => {
  // Early return if the element isn't available yet.
  if (!pdfContent.value) {
    return;
  }

  const options = {
    margin: 1,
    filename: 'my-document-composition.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  // 3. Call html2pdf, passing the `.value` of the ref.
  html2pdf().from(pdfContent.value).set(options).save();
};
</script>

<style scoped>
/* Styles remain the same */
div {
  padding: 20px;
}
h1 {
  color: #42b983; /* Vue green */
}
</style>