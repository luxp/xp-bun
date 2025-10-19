import { Form, Input, Modal } from "antd";
import type { GenerateFormData } from "../types";

interface GenerateModalProps {
  visible: boolean;
  loading: boolean;
  onOk: (values: GenerateFormData) => void;
  onCancel: () => void;
}

export default function GenerateModal({
  visible,
  loading,
  onOk,
  onCancel,
}: GenerateModalProps) {
  const [form] = Form.useForm();

  // 处理生成
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      onOk(values);
    } catch (error) {
      console.error("表单验证失败", error);
    }
  };

  // 处理取消
  const handleCancel = () => {
    form.resetFields();
    onCancel();
  };

  return (
    <Modal
      title="生成烟花"
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      confirmLoading={loading}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          prompt:
            "生成美丽的烟花视频，期望有多次的爆炸，注意烟花要和现实中的一样，不要看着像假的",
          aiModel: "veo-2",
        }}
      >
        <Form.Item
          label="提示词"
          name="prompt"
          rules={[{ required: true, message: "请输入提示词" }]}
        >
          <Input.TextArea
            rows={4}
            placeholder="请描述您想要的烟花效果，例如：生成美丽的烟花视频，期望有多次的爆炸，注意烟花要和现实中的一样，不要看着像假的"
          />
        </Form.Item>

        <Form.Item
          label="AI模型"
          name="aiModel"
          rules={[{ required: true, message: "请选择AI模型" }]}
        >
          <Input placeholder="请输入AI模型，如：veo-2, veo-3.1-fast" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
