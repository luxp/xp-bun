import { DownloadOutlined } from "@ant-design/icons";
import { Button, Modal, message } from "antd";

interface VideoPreviewModalProps {
  visible: boolean;
  videoUrl: string;
  videoName: string;
  onClose: () => void;
}

export default function VideoPreviewModal({
  visible,
  videoUrl,
  videoName,
  onClose,
}: VideoPreviewModalProps) {
  // 下载视频
  const handleDownloadVideo = () => {
    if (!videoUrl) return;

    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = videoName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success("开始下载视频");
  };

  return (
    <Modal
      title={`视频预览 - ${videoName}`}
      open={visible}
      onCancel={onClose}
      width={800}
      footer={[
        <Button
          key="download"
          type="primary"
          icon={<DownloadOutlined />}
          onClick={handleDownloadVideo}
        >
          下载视频
        </Button>,
        <Button key="close" onClick={onClose}>
          关闭
        </Button>,
      ]}
    >
      {videoUrl && (
        <div style={{ textAlign: "center" }}>
          <video
            controls
            key={videoUrl}
            style={{ width: "100%", maxHeight: "500px" }}
            preload="metadata"
          >
            <source src={videoUrl} type="video/mp4" />
            您的浏览器不支持视频播放。
          </video>
          <div style={{ marginTop: "16px", color: "#666" }}>
            <p>视频文件: {videoName}</p>
            <p>
              预览地址:{" "}
              <a href={videoUrl} target="_blank" rel="noopener noreferrer">
                {videoUrl}
              </a>
            </p>
          </div>
        </div>
      )}
    </Modal>
  );
}
