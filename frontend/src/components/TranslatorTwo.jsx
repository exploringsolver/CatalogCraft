import React, { useEffect, useRef } from 'react'

function TranslatorTwo() {

    const googleTranslateRef = useRef(null);

    useEffect(() => {
        let intervalId = null;
        let timeoutId = null;
        let disposed = false;

        const checkGoogleTranslate = () => {
            const mountNode = googleTranslateRef.current;
            if (
                disposed ||
                !mountNode ||
                mountNode.dataset.translateReady === 'true' ||
                !window.google ||
                !window.google.translate
            ) {
                return;
            }

            try {
                mountNode.dataset.translateReady = 'true';
                new window.google.translate.TranslateElement(
                    {
                        pageLanguage: "en",
                        layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
                    },
                    mountNode
                );
                clearInterval(intervalId);
            } catch (error) {
                mountNode.dataset.translateReady = 'false';
                console.error("Failed to initialize Google Translate widget:", error);
            }
        };

        intervalId = setInterval(checkGoogleTranslate, 250);
        timeoutId = setTimeout(() => clearInterval(intervalId), 10000);
        checkGoogleTranslate();

        return () => {
            disposed = true;
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [])
    return (
        <>
            <div className='fixed right-4 bottom-4 xl:right-16 xl:bottom-16 z-[1000]' ref={googleTranslateRef}></div>
        </>
    )
}

export default TranslatorTwo;