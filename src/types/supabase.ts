
export type Profile = {
  id: string;
  username: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan: 'free' | 'pro' | 'unlimited';
  status: 'active' | 'inactive' | 'expired';
  remaining_enhancements: number;
  max_file_size: number;
  created_at: string;
  updated_at: string;
  expiry_date: string;
};

export type EnhancedImage = {
  id: string;
  user_id: string;
  original_url: string;
  enhanced_url: string;
  enhancement_type: string;
  quality: string;
  created_at: string;
};

export type QualityOption = '2x' | '4x' | '8x';
