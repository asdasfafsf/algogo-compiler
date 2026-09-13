public class Main {
    private static void recurse() {
        recurse();
    }

    public static void main(String[] args) throws InterruptedException {
        final Throwable[] failure = new Throwable[1];
        Thread thread = new Thread(null, () -> {
            try {
                recurse();
            } catch (Throwable error) {
                failure[0] = error;
            }
        }, "recursive-overflow", 64 * 1024);
        thread.start();
        thread.join();
        if (failure[0] instanceof Error) {
            throw (Error) failure[0];
        }
    }
}
