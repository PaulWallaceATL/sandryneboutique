"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import HoverPreview, {
  type HoverTarget,
} from "@/components/react-bits/hover-preview";
import { buildMentionPlan } from "@/lib/blog/product-mentions";
import type { Product } from "@/lib/types";

interface BlogMarkdownProps {
  content: string;
  /** Catalog products used to auto-link names + hover previews. */
  products: Product[];
}

function hasHref(props: Record<string, unknown>): boolean {
  return typeof props.href === "string";
}

function MentionText({
  text,
  products,
  onTargetClick,
}: {
  text: string;
  products: Product[];
  onTargetClick: (target: HoverTarget) => void;
}) {
  const plan = buildMentionPlan(text, products);
  if (!plan) return <>{text}</>;

  return (
    <HoverPreview
      content={plan.content}
      targets={plan.targets}
      onTargetClick={onTargetClick}
      imagePosition="above"
      imageWidth={160}
      imageHeight={200}
      imageBorderRadius="0"
      maxRotation={8}
      targetClassName="underline underline-offset-4 decoration-foreground/25 hover:decoration-foreground font-medium text-foreground transition-colors"
      className="inline align-baseline"
    />
  );
}

function enhanceNodes(
  nodes: ReactNode,
  products: Product[],
  onTargetClick: (target: HoverTarget) => void,
): ReactNode {
  return Children.map(nodes, (child) => {
    if (typeof child === "string") {
      return (
        <MentionText
          text={child}
          products={products}
          onTargetClick={onTargetClick}
        />
      );
    }

    if (!isValidElement<{ children?: ReactNode } & Record<string, unknown>>(child)) {
      return child;
    }

    // Leave existing links alone (explicit markdown links / CTAs).
    if (hasHref(child.props)) {
      return child;
    }

    if (child.props.children == null) {
      return child;
    }

    return cloneElement(child, {
      ...child.props,
      children: enhanceNodes(child.props.children, products, onTargetClick),
    });
  });
}

export function BlogMarkdown({ content, products }: BlogMarkdownProps) {
  const router = useRouter();

  const onTargetClick = (target: HoverTarget) => {
    if (target.linkUrl) router.push(target.linkUrl);
  };

  const withMentions = (children: ReactNode) =>
    enhanceNodes(children, products, onTargetClick);

  return (
    <ReactMarkdown
      components={{
        h2: ({ children }) => (
          <h2 className="font-serif text-3xl tracking-tight mt-12 mb-4 text-foreground">
            {withMentions(children)}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="font-serif text-2xl tracking-tight mt-10 mb-3 text-foreground">
            {withMentions(children)}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-5">{withMentions(children)}</p>
        ),
        li: ({ children }) => <li>{withMentions(children)}</li>,
        ul: ({ children }) => (
          <ul className="list-disc pl-6 mb-5 flex flex-col gap-1.5">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-6 mb-5 flex flex-col gap-1.5">{children}</ol>
        ),
        a: ({ href, children }) => (
          <Link
            href={href ?? "#"}
            className="underline underline-offset-4 hover:opacity-60 transition-opacity"
          >
            {children}
          </Link>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-foreground/20 pl-5 italic my-6">
            {withMentions(children)}
          </blockquote>
        ),
        strong: ({ children }) => <strong>{withMentions(children)}</strong>,
        em: ({ children }) => <em>{withMentions(children)}</em>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
