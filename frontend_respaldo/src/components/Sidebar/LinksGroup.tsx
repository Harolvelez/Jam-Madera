import { useState } from "react";
import { Group, Collapse, ThemeIcon, UnstyledButton, Text } from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import classes from "./SidebarNested.module.css";

interface LinksGroupProps {
  icon: any;
  label: string;
  initiallyOpened?: boolean;
  link?: string;
  links?: { label: string; link: string }[];
}


export function LinksGroup({
  icon: Icon,
  label,
  initiallyOpened,
  links,
  link,
}: LinksGroupProps) {
  const [opened, setOpened] = useState(initiallyOpened || false);
  const hasLinks = Array.isArray(links);

  // 🔹 CASO 1: link directo (ej: Estados de órdenes)
  if (!hasLinks && link) {
    return (
      <Text
        component="a"
        href={link}
        className={classes.control}
      >
        <Group>
          <ThemeIcon variant="light" size={30}>
            <Icon size={18} />
          </ThemeIcon>
          <Text>{label}</Text>
        </Group>
      </Text>
    );
  }

  // 🔹 CASO 2: menú con sub-links
  const items = (links ?? []).map((item) => (
    <Text
      component="a"
      href={item.link}
      className={classes.link}
      key={item.label}
    >
      {item.label}
    </Text>
  ));

  return (
    <>
      <UnstyledButton
        onClick={() => setOpened((o) => !o)}
        className={classes.control}
      >
        <Group justify="space-between">
          <Group>
            <ThemeIcon variant="light" size={30}>
              <Icon size={18} />
            </ThemeIcon>
            <Text>{label}</Text>
          </Group>

          <IconChevronRight
            className={classes.chevron}
            size={16}
            style={{
              transform: opened ? "rotate(90deg)" : "none",
            }}
          />
        </Group>
      </UnstyledButton>

      <Collapse in={opened}>{items}</Collapse>
    </>
  );
}
