import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { setToken } from "@/lib/auth";
import { loginAdmin } from "@/lib/api";
import PainelPage from "./page";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock("@/lib/api", () => ({
  loginAdmin: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  setToken: vi.fn(),
}));

const mockedLoginAdmin = vi.mocked(loginAdmin);
const mockedSetToken = vi.mocked(setToken);

const renderPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <PainelPage />
    </QueryClientProvider>,
  );
};

describe("PainelPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve renderizar o titulo da página", () => {
    renderPage();

    expect(screen.getByText("Área Restrita")).toBeInTheDocument();
  });

  it("deve renderizar os campos de login e o botão entrar", () => {
    renderPage();

    expect(screen.getByPlaceholderText("Usuário")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Senha")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
  });

  it("deve mostrar mensagem de campo obrigatório ao enviar o formulário vazio", async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Campo obrigatório")).toBeInTheDocument();
  });

  it("deve mostrar mensagem de erro quando o login falhar", async () => {
    const user = userEvent.setup();
    mockedLoginAdmin.mockRejectedValueOnce(new Error("Invalid credentials"));

    renderPage();

    await user.type(screen.getByPlaceholderText("Usuário"), "teste@email.com");
    await user.type(screen.getByPlaceholderText("Senha"), "senha-incorreta");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(
      await screen.findByText("Login ou Senha incorreto!"),
    ).toBeInTheDocument();
  });

  it("deve realizar o login com sucesso", async () => {
    const user = userEvent.setup();

    mockedLoginAdmin.mockResolvedValueOnce({
      token: "token-de-teste",
    });

    renderPage();

    await user.type(screen.getByPlaceholderText("Usuário"), "teste@email.com");
    await user.type(screen.getByPlaceholderText("Senha"), "senha-correta");
    await user.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/gerenciar");
    });

    expect(mockedLoginAdmin).toHaveBeenCalledTimes(1);
    expect(mockedLoginAdmin.mock.calls[0][0]).toEqual({
      email: "teste@email.com",
      password: "senha-correta",
    });
    expect(mockedSetToken).toHaveBeenCalledWith("token-de-teste");
  });
});
