WidgetMetadata = {
  id: "gayVideo",
  title: "gayVideo",
  description: "获取 gayVideo 视频",
  author: "xxx",
  site: "https://github.com/quantumultxx/FW-Widgets",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  detailCacheDuration: 60,
  modules: [
    {
      title: "浏览视频",
      functionName: "loadList",
      type: "video",
      params: [
        { name: "page", title: "页码", type: "page" },
        {
          name: "category",
          title: "分类",
          type: "enumeration",
          value: "new",
          enumOptions: [
            { title: "中国", value: "cat/chinese" },
            { title: "台湾", value: "cat/taiwanese" },
            { title: "亚洲", value: "cat/asian" },
            { title: "日本", value: "cat/japanese" },
            { title: "韩国", value: "cat/korean" },
            { title: "泰国", value: "cat/thai" },
            { title: "越南", value: "cat/vietnamese" },
            { title: "泰国高清", value: "cat/thai-hd" },
            { title: "亚洲按摩", value: "cat/asian-massage" },
            { title: "中国自制", value: "cat/chinese-homemade" },
            { title: "亚洲帅哥", value: "cat/asian-hunk" },
            { title: "中国人高清", value: "cat/chinese-hd" },
            { title: "剧情", value: "cat/story" },
            { title: "twink", value: "cat/twink" },
            { title: "中国自制", value: "cat/chinese-homemade" },
            { title: "亚洲帅哥", value: "cat/asian-hunk" },
            { title: "中国人高清", value: "cat/chinese-hd" }
          ]
        },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          value: "released_at",
          enumOptions: [
            { title: "发布日期", value: "released_at" },
            { title: "今日浏览", value: "today_views" },
            { title: "总浏览量", value: "views" },
            { title: "收藏数", value: "saved" }
          ]
        }
      ]
    }
  ],
};

const BASE_URL = "https://www.gaymaletube.com/zh";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
};

async function loadList(params = {}) {
  const { page = 1, category = "cat/chinese" } = params;

  let url = `${BASE_URL}/${category}`;
  if (page > 1) url += `?page=${page}`;

  try {
    const res = await Widget.http.get(url, { headers: HEADERS });
    const html = res.data;

    if (!html) {
      return [{ id: "err", type: "text", title: "无返回内容" }];
    }

    const $ = Widget.html.load(html);
    const results = [];

    $(".cards-container .card").each((i, el) => {
      const $el = $(el);

      const $link = $el.find("a.item-link").first();
      const href = $link.attr("href");
      if (!href) return;

      const title =
        $el.find("a.item-title").first().text().trim() ||
        $link.attr("title") ||
        "";

      const imgSrc =
        $el.find("img.item-image").attr("src") ||
        $el.find("img.item-image").attr("data-src") ||
        "";

      // 时长在右下角 badge 里，可能包含“HD”，这里只取文本并去空格
      const duration = $el
        .find(".item-meta-container .badge")
        .first()
        .text()
        .replace(/\s+/g, " ")
        .trim();

      results.push({
        id: href,
        type: "link",
        title: title || "未命名",
        coverUrl: imgSrc,
        link: href,
        description: duration ? `时长: ${duration}` : "",
        customHeaders: HEADERS
      });
    });

    return results;
  } catch (e) {
    return [{ id: "err", type: "text", title: "加载失败", subTitle: e.message }];
  }
}


async function parseHtml(htmlContent) {
  const $ = Widget.html.load(htmlContent);
  const sectionSelector = ".site-content .py-3,.pb-e-lg-40";
  const itemSelector = ".video-img-box";
  const coverSelector = "img";
  const durationSelector = ".absolute-bottom-right .label";
  const titleSelector = ".title a";

  let sections = [];
  const sectionElements = $(sectionSelector).toArray();

  for (const sectionElement of sectionElements) {
    const $sectionElement = $(sectionElement);
    var items = [];
    const sectionTitle = $sectionElement.find(".title-box .h3-md").first();
    const sectionTitleText = sectionTitle.text();
    const itemElements = $sectionElement.find(itemSelector).toArray();

    if (itemElements && itemElements.length > 0) {
      for (const itemElement of itemElements) {
        const $itemElement = $(itemElement);
        const titleId = $itemElement.find(titleSelector).first();
        const url = titleId.attr("href") || "";

        if (url && url.includes("jable.tv")) {
          const durationId = $itemElement.find(durationSelector).first();
          const coverId = $itemElement.find(coverSelector).first();
          const cover = coverId.attr("data-src");
          const video = coverId.attr("data-preview");
          const title = titleId.text();
          const duration = durationId.text().trim();

          const item = {
            id: url,
            type: "url",
            title: title,
            backdropPath: cover,
            previewUrl: video,
            link: url,
            mediaType: "movie",
            durationText: duration,
            description: duration,
            playerType: "system",
          };
          items.push(item);
        }
      }
    }

    if (items.length > 0) {
      sections.push({
        title: sectionTitleText,
        childItems: items
      });
    }
  }

  return sections;
}

async function loadDetail(link) {
  const response = await Widget.http.get(link, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });
  const hlsUrl = response.data.match(/var hlsUrl = '(.*?)';/)[1];
  if (!hlsUrl) {
    throw new Error("无法获取有效的HLS URL");
  }
  const item = {
    id: link,
    type: "detail",
    videoUrl: hlsUrl,
    mediaType: "movie",
    playerType: "system",
    customHeaders: {
      "Referer": link,
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  };
  const sections = await parseHtml(response.data);
  const items = sections.flatMap((section) => section.childItems);
  if (items.length > 0) {
    item.childItems = items;
  }
  return item;
}