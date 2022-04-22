import pushbullet from "../../pushbullet.app.mjs";
import constants from "../common/constants.mjs";

export default {
  name: "Send push (Note, Link and File)",
  version: "0.0.1",
  key: "pushbullet-send-push",
  description: "Send a push to a device or another person. [See docs here](https://docs.pushbullet.com/#create-push)",
  type: "action",
  props: {
    pushbullet,
    device: {
      propDefinition: [
        pushbullet,
        "device",
      ],
    },
    email: {
      label: "Email",
      description: "Send the push to this email address. If that email address is associated with a Pushbullet user, we will send it directly to that user, otherwise we will fallback to sending an email to the email address (this will also happen if a user exists but has no devices registered).",
      type: "string",
      optional: true,
    },
    channel_tag: {
      label: "Channel Tag ",
      description: "Send the push to all subscribers to your channel that has this tag.",
      type: "string",
      optional: true,
    },
    type: {
      label: "Push Type",
      description: "The type of push you want to send",
      type: "string",
      options: constants.PUSH_TYPES,
      reloadProps: true,
    },
  },
  async additionalProps() {
    const props = {};

    const title = {
      label: "Title",
      description: "",
      type: "string",
    };
    const body = {
      label: "Body",
      description: "",
      type: "string",
    };
    const url = {
      label: "Url",
      description: "The url to open",
      type: "string",
    };
    const fileName = {
      label: "File Name",
      description: "The name of the file.",
      type: "string",
    };
    const fileType = {
      label: "File Type",
      description: "The MIME type of the file.",
      type: "string",
    };
    const fileUrl = {
      label: "File URL",
      description: "The url for the file.",
      type: "string",
    };

    if (this.type === "note") {
      title.description = "The note's title";
      props["title"] = title;

      body.description = "The note's message";
      props["body"] = body;
    }

    if (this.type === "link") {
      title.description = "The link's title";
      props["title"] = title;

      body.description = "A message associated with the link";
      props["body"] = body;

      url.description = "The url to open";
      props["url"] = url;
    }

    if (this.type === "file") {
      body.description = "A message to go with the file";
      props["body"] = body;

      props["fileName"] = fileName;
      props["fileType"] = fileType;
      props["fileUrl"] = fileUrl;
    }

    return props;
  },
  async run({ $ }) {
    if (this.type === "file") {
      const {
        fileName,
        fileType,
        fileUrl,
      } = this;

      const fileBuffer = await this.pushbullet.downloadFile({
        fileUrl,
        $,
      });

      const response = await this.pushbullet.getUploadUrl({
        data: {
          file_name: fileName,
          file_type: fileType,
        },
        $,
      });

      await this.pushbullet.uploadFile({
        uploadUrl: response.upload_url,
        fileBuffer,
        $,
      });

      this.fileUrl = response.file_url;
    }

    const response = await this.pushbullet.sendPush({
      data: {
        type: this.type,
        title: this.title,
        body: this.body,
        url: this.url,
        file_name: this.fileName,
        file_type: this.fileType,
        file_url: this.fileUrl,
      },
      $,
    });

    $.export("$summary", `Successfully send a push ${this.file}`);

    return response;
  },
};
