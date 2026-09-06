import React, { useState } from 'react';
import { Facebook, Twitter, Share2, Link, Check, MessageCircle } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

const ShareButtons = ({ url, title, description }) => {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = url || window.location.href;
  const shareTitle = title || document.title;
  const shareDescription = description || '';
  
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(shareTitle);
  const encodedDescription = encodeURIComponent(shareDescription);
  
  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
  };
  
  const handleShare = (platform) => {
    const link = shareLinks[platform];
    window.open(link, '_blank', 'width=600,height=400,noopener,noreferrer');
  };
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareDescription,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    }
  };
  
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-slate-500 dark:text-slate-400 mr-1">Share:</span>
      
      {/* Facebook */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('facebook')}
        className="h-9 w-9 p-0 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-600 dark:hover:bg-blue-900/20"
        title="Share on Facebook"
      >
        <Facebook className="h-4 w-4" />
      </Button>
      
      {/* Twitter/X */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('twitter')}
        className="h-9 w-9 p-0 hover:bg-sky-50 hover:border-sky-500 hover:text-sky-600 dark:hover:bg-sky-900/20"
        title="Share on X (Twitter)"
      >
        <Twitter className="h-4 w-4" />
      </Button>
      
      {/* WhatsApp */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleShare('whatsapp')}
        className="h-9 w-9 p-0 hover:bg-green-50 hover:border-green-500 hover:text-green-600 dark:hover:bg-green-900/20"
        title="Share on WhatsApp"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
      
      {/* Copy Link */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopyLink}
        className={`h-9 px-3 ${copied ? 'bg-green-50 border-green-500 text-green-600 dark:bg-green-900/20' : ''}`}
        title="Copy link"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 mr-1" />
            Copied
          </>
        ) : (
          <>
            <Link className="h-4 w-4 mr-1" />
            Copy
          </>
        )}
      </Button>
      
      {/* Native Share (mobile) */}
      {navigator.share && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleNativeShare}
          className="h-9 w-9 p-0 hover:bg-orange-50 hover:border-orange-500 hover:text-orange-600 dark:hover:bg-orange-900/20"
          title="More sharing options"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

export default ShareButtons;
