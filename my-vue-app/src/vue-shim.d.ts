declare module 'html2pdf.js';
declare module '*.vue' {
    import { DefineComponent } from "vue";
    const component: DefineComponent<{}, {}, any>;
    export default component;
  }
  