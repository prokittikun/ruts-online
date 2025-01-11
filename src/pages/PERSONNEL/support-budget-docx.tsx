import React, { useEffect, useRef } from "react";

function ApproveDocx() {
  const viewer = useRef(null);

  useEffect(() => {
    // Only import and initialize WebViewer on the client side
    const initWebViewer = async () => {
      const WebViewer = (await import("@pdftron/webviewer")).default;

      WebViewer(
        {
          path: "/webviewer/lib", // Update this path
          initialDoc: "/webviewer/2.docx",
          enableOfficeEditing: true,
        },
        viewer.current!,
      )
      // .then((instance) => {
      //   const { docViewer } = instance;
      //   // you can now call WebViewer APIs here...
      // });
    };

    initWebViewer();
  }, []);

  return (
    <div className="MyComponent overflow-y-hidden">
      <div className="webviewer h-screen" ref={viewer} ></div>
    </div>
  );
}

export default ApproveDocx;
