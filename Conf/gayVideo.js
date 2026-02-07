WidgetMetadata = {
  id: "gayVideo",
  title: "video",
  description: "获取Video 视频",
  author: "xxx",
  site: "https://github.com/quantumultxx/FW-Widgets",
  version: "0.0.11",
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
            { title: "中国", value: "chinese" },
            { title: "台湾", value: "taiwanese" },
            { title: "亚洲", value: "asian" },
            { title: "日本", value: "japanese" },
            { title: "韩国", value: "korean" },
            { title: "泰国", value: "thai" },
            { title: "越南", value: "vietnamese" },
            { title: "泰国高清", value: "thai-hd" },
            { title: "亚洲按摩", value: "asian-massage" },
            { title: "中国自制", value: "chinese-homemade" },
            { title: "亚洲帅哥", value: "asian-hunk" },
            { title: "中国人高清", value: "chinese-hd" },
            { title: "剧情", value: "story" },
            { title: "twink", value: "twink" },
            { title: "中国自制", value: "chinese-homemade" },
            { title: "亚洲帅哥", value: "asian-hunk" },
            { title: "中国人高清", value: "chinese-hd" }
          ]
        },
        {
          name: "advertiser_publish_date",
          title: "已添加日期",
          type: "enumeration",
          value: "",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "过去24小时", value: "1D" },
            { title: "过去两天", value: "2D" },
            { title: "过去一周", value: "7D" },
            { title: "过去一个月", value: "1M" },
            { title: "过去三个月", value: "3M" },
            { title: "过去一年", value: "1Y" }
          ]
        },
        {
          name: "duration",
          title: "排序",
          type: "enumeration",
          value: "",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "1+分钟", value: "60" },
            { title: "5+分钟", value: "300" },
            { title: "10+分钟", value: "600" },
            { title: "20+分钟", value: "1200" },
            { title: "30+分钟", value: "1800" },
            { title: "60+分钟", value: "3600" },
            { title: "0-10分钟", value: "0-600" },
            { title: "0-20分钟", value: "0-1200" }
          ]
        },
        {
          name: "sort",
          title: "排序",
          type: "enumeration",
          value: "popular",
          enumOptions: [
            { title: "人气", value: "popular" },
            { title: "日期", value: "date" },
            { title: "持续时间", value: "duration" },
            { title: "评分", value: "rating" }
          ]
        }
      ]
    },
    {
      title: "获取视频详情",
      functionName: "loadDetail",
      type: "video",
      params: [
        { name: "page", title: "页码", type: "page" },
        {
          name: "advertiser_publish_date",
          title: "已添加日期",
          type: "enumeration",
          value: "",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "过去24小时", value: "1D" },
            { title: "过去两天", value: "2D" },
            { title: "过去一周", value: "7D" },
            { title: "过去一个月", value: "1M" },
            { title: "过去三个月", value: "3M" },
            { title: "过去一年", value: "1Y" }
          ]
        },
      ]
    }
  ]
};

const BASE_URL = "https://www.gaymaletube.com";
const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
  "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
};

async function loadList(params = {}) {
  const { page = 1, category = "chinese", advertiser_publish_date = "", duration = "", sort = "popular" } = params;

  const qs = `filter%5Badvertiser_publish_date%5D=${advertiser_publish_date}&filter%5Bduration%5D=${duration}&filter%5Bquality%5D=&filter%5Bvirtual_reality%5D=&filter%5Badvertiser_site%5D=&filter%5Border_by%5D=${sort}`;

  let url = `${BASE_URL}/zh/cat/${category}?${qs}`;
  console.log(`Constructed URL: ${url}`);

  if (page > 1) url += `&page=${page}`;

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

async function loadDetail(link) {
  // 1. 拼接完整 URL
  const link111 = "/out/?l=3AASGc4eAkCOq0s2bExFM2dVZFg1AtmIaHR0cHM6Ly93d3cuYmZodWIuY29tL3ZpZGVvcy8xNTc5NDAzL2RhZGR5LWd5bS1nZXQtaG90LWZ1Y2tlZC1ieS1hLWhhbmRzb21lLXN0cmFpZ2h0LWd1eS8/dXRtX3NvdXJjZT1hd24mdXRtX21lZGl1bT10Z3AmdXRtX2NhbXBhaWduPWNwY80BlaJ0YwFFp3BvcHVsYXIB2St7ImFsbCI6IiIsIm9yaWVudGF0aW9uIjoiZ2F5IiwicHJpY2luZyI6IiJ9zPzOaYbk2ahjYXRlZ29yec12y8DZPVt7IjEiOiJhVzhiMTdJVUpaZiJ9LHsiMiI6InhjMm9FWGQ1aTVIIn0seyIzIjoianJmTjVQU2V6a2sifV0%3D&c=03b82d74&v=3&"

  // const url = BASE_URL + link; // 直接拼接，避免解析错误导致的路径问题
  let url = `${BASE_URL}${link111}`;

  console.log(`Loading detail from URL: ${url}`);
  try {
    // 2. 发起请求 (Widget.http 默认会自动跟随重定向到目标网站)
    const res = await Widget.http.get(url, { headers: HEADERS });
    const html = res.data;

    console.log(`Detail page loaded, parsing content...: ${html}`);

    const $ = Widget.html.load(html);

    // 3. 获取基础信息 (尝试从 OpenGraph 标签或 Title 获取)
    let title = $('meta[property="og:title"]').attr('content') || $("title").text().trim();
    let coverUrl = $('meta[property="og:image"]').attr('content');

    console.log(`Parsed title: ${title}`);
    console.log(`Parsed cover URL: ${coverUrl}`);

    // 4. 通用视频地址嗅探 (逻辑参考 MISSAV)
    let videoUrl = "";

    // 1. 提取 sources 数组 (最关键的一步)
    // 正则含义：匹配 "var sources =" 后面直到 ";" 之前的所有内容
    const sourcesMatch = html.match(/var\s+sources\s*=\s*(\[.*?\]);/s);
    
    console.log(`Sources match: ${sourcesMatch}`);

    if (sourcesMatch && sourcesMatch[1]) {
        try {
            // 解析 JSON
            const sources = JSON.parse(sourcesMatch[1]);
            
            // 2. 挑选最佳画质
            // 策略：优先找 desc 为 "720p" 或 "1080p" 的，找不到就拿第一个
            let bestSource = sources.find(s => s.desc === "1080p") || 
                             sources.find(s => s.desc === "720p") || 
                             sources[0];
                             
            if (bestSource && bestSource.src) {
                videoUrl = bestSource.src;
            }
            return false; // 已找到视频地址，后续步骤不再执行
        } catch (e) {
            console.log("解析 sources JSON 失败: " + e.message);
        }
    }

    if (!videoUrl) {
            // 最后尝试一下简单的 source = ...
            const matchSimple = html.match(/source\s*=\s*['"]([^'"]+)['"]/);
            if (matchSimple) videoUrl = matchSimple[1];
        }

        if (videoUrl) {
            return [{
                id: link,
                type: "video",
                title: title,
                videoUrl: videoUrl,
                playerType: "system",
                customHeaders: {
                    "Referer": "https://missav.ai/", // 必须是根域名，不能是 link
                    "User-Agent": HEADERS["User-Agent"],
                    "Origin": "https://missav.ai"
                }
            }];
        } else {
            return [{ id: "err", type: "text", title: "解析失败", subTitle: "未找到播放地址" }];
        }

  } catch (e) {
    return [{ id: "err", type: "text", title: "加载详情失败", subTitle: e.message }];
  }
}