// Webmention送信自動化の型定義

export interface WebmentionHistory {
  version: string;
  last_updated: string;
  sent_webmentions: {
    dailylog: DailylogWebmention[];
    clippingshare: ClippingWebmention[];
    blog_updates: BlogUpdateWebmention[];
  };
}

export interface DailylogWebmention {
  entry_id: string;
  source_url: string;
  target_url: string;
  sent_at: string;
  status: 'success' | 'failed' | 'pending';
  response_code?: number;
  error_message?: string;
}

export interface ClippingWebmention {
  clip_id: string;
  source_url: string;
  target_url: string;
  sent_at: string;
  status: 'success' | 'failed' | 'pending';
  response_code?: number;
  error_message?: string;
}

export interface BlogUpdateWebmention {
  update_id: string;
  post_url: string;
  post_title: string;
  update_comment: string;
  format: 'note' | 'article';
  temp_file_path?: string;
  sent_at: string;
  bridgy_url: string;
  status: 'success' | 'failed' | 'pending';
  response_code?: number;
  error_message?: string;
}

export interface WebmentionConfig {
  rate_limit: {
    requests_per_minute: number;
    retry_attempts: number;
    retry_delay_seconds: number;
  };
  endpoints: {
    bridgy_bluesky: string;
    bridgy_mastodon: string;
  };
  sources: {
    dailylog: {
      enabled: boolean;
      data_file: string;
      base_url: string;
    };
    clippingshare: {
      enabled: boolean;
      data_file: string;
      base_url: string;
    };
    blog_updates: {
      enabled: boolean;
      format: 'note' | 'article';
      significant_only: boolean;
      template: {
        comment_max_length: number;
        include_title_link: boolean;
        temp_file_dir: string;
      };
      rate_limit: {
        same_post_hours: number;
        daily_limit: number;
      };
    };
  };
}

export interface DailylogEntry {
  id: string;
  content: string;
  timestamp: string;
  links?: string[];
}

export interface ClippingEntry {
  id: string;
  title: string;
  url: string;
  like_url?: string;
  timestamp: string;
}

export interface BlogPost {
  url: string;
  title: string;
  updated?: string;
  update_comment?: string;
  significant_update?: boolean;
}

export interface WebmentionSendResult {
  success: boolean;
  response_code?: number;
  error_message?: string;
  sent_at: string;
}
