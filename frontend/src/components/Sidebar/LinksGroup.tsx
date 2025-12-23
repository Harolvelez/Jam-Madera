import { useState, useEffect } from "react";
import {
  Group,
  Box,
  Collapse,
  ThemeIcon,
  UnstyledButton,
  Text,
} from "@mantine/core";
import { IconChevronRight } from "@tabler/icons-react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();
  const hasLinks = Array.isArray(links);

  // 🔥 Detectar si algún hijo está activo
  const isChildActive =
    hasLinks &&
    links!.some((l) => location.pathname.startsWith(l.link));

  // 🔥 Detectar si este item está activo (para links directos)
  const isActive = link && location.pathname === link;

  const [opened, setOpened] = useState(
    initiallyOpened || isChildActive || false
  );

  // 🔄 Abrir automáticamente si estoy dentro de los hijos
  useEffect(() => {
    if (isChildActive) setOpened(true);
  }, [isChildActive]);

  // 🔹 CASO 1: LINK DIRECTO (sin submenú)
  if (!hasLinks && link) {
    return (
      <NavLink
        to={link}
        className={({ isActive }) => 
          `${classes.control} ${isActive ? classes.controlActive : ""}`
        }
        end
      >
        <Group>
          <ThemeIcon variant="light" size={30}>
            <Icon size={18} />
          </ThemeIcon>
          <Text fw={isActive ? 600 : 400}>{label}</Text>
        </Group>
      </NavLink>
    );
  }

  // 🔹 CASO 2: MENÚ CON SUB-LINKS
  const items = (links ?? []).map((item) => {
    const childActive = location.pathname === item.link;
    
    return (
      <NavLink
        key={item.label}
        to={item.link}
        className={({ isActive }) => 
          `${classes.link} ${isActive ? classes.linkActive : ""}`
        }
        end
      >
        <Text fw={childActive ? 600 : 400}>{item.label}</Text>
      </NavLink>
    );
  });

  const handleClick = () => {
    if (hasLinks) {
      setOpened((o) => !o);
    } else if (link) {
      navigate(link);
    }
  };

  return (
    <>
      <UnstyledButton
        onClick={handleClick}
        className={`${classes.control} ${
          isActive || isChildActive ? classes.controlActive : ""
        }`}
      >
        <Group justify="space-between">
          <Group>
            <ThemeIcon variant="light" size={30}>
              <Icon size={18} />
            </ThemeIcon>
            <Text fw={isActive || isChildActive ? 600 : 400}>
              {label}
            </Text>
          </Group>

          {hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              size={16}
              style={{
                transform: opened ? "rotate(90deg)" : "none",
              }}
            />
          )}
        </Group>
      </UnstyledButton>

      {hasLinks && <Collapse in={opened}>{items}</Collapse>}
    </>
  );
}