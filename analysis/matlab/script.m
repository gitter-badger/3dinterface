timecoins;
plot(X,Y1);
hold on;
names = who('Y*');

N = size(names, 1);

for i = 1:N,
    name = names(i)
    name = name{1};
    plot(X, eval(name));
    pause
    clf
end

close all;
