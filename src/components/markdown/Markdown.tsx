import { useEffect, useRef } from 'react';
import { marked } from 'marked';
import { adapterForMathJax } from './MathJax';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.css';
import './onedark.css';

export const MARKED_CLASS_NAME = 'marked';

interface IProps {
  mdText: string;
}

export default function Markdown(props: IProps) {
  const md = marked.parse(adapterForMathJax(props.mdText));
  const divRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (divRef.current) {
      divRef.current.querySelectorAll('code').forEach(el => {
        hljs.highlightElement(el);
      });
    }
  }, [props.mdText]);
  return (
    <div className='marked' dangerouslySetInnerHTML={{ __html: md }} ref={divRef}>
    </div>
  );
}
